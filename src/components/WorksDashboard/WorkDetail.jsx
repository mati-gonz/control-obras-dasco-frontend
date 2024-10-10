import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import { useAuth } from '../../context/useAuth';
import axiosInstance from '../../services/axiosInstance';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Modal, MenuItem, Select, FormControl, InputLabel, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Componente para renderizar cada tabla
const TabPanel = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
};

const WorkDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();  // Accede a los datos de autenticación
    const navigate = useNavigate();
    const [work, setWork] = useState(null);
    const [subgroups, setSubgroups] = useState([]);
    const [uncategorizedParts, setUncategorizedParts] = useState([]);
    const [newPartName, setNewPartName] = useState('');
    const [newPartBudget, setNewPartBudget] = useState('');
    const [selectedSubgroup, setSelectedSubgroup] = useState('');
    const [newSubgroupName, setNewSubgroupName] = useState('');
    const [newSubgroupBudget, setNewSubgroupBudget] = useState('');
    const [isSubgroupModalOpen, setIsSubgroupModalOpen] = useState(false);
    const [value, setValue] = useState(0); // Estado para las pestañas

    useEffect(() => {
        fetchWorkDetails();
    }, [id]);

    const fetchWorkDetails = async () => {
        try {
            const workResponse = await axiosInstance.get(`/works/${id}`);
            const subgroupsResponse = await axiosInstance.get(`/subgroups/${id}/subgroups?page=1&limit=100`);
            const partsResponse = await axiosInstance.get(`/parts/${id}/parts?page=1&limit=100`);

            setWork(workResponse.data);

            const uncategorized = partsResponse.data.data.filter(part => part.subgroupId === null);
            const uncategorizedWithExpenses = await fetchPartsWithExpenses(uncategorized);

            setUncategorizedParts(uncategorizedWithExpenses);

            const subgroupsWithParts = await Promise.all(subgroupsResponse.data.data.map(async (subgroup) => {
                const partsForSubgroup = partsResponse.data.data.filter(part => part.subgroupId === subgroup.id);
                const partsWithExpenses = await fetchPartsWithExpenses(partsForSubgroup);

                const accumulatedBudget = partsWithExpenses.reduce((acc, part) => acc + parseFloat(part.budget), 0);
                const accumulatedSpent = partsWithExpenses.reduce((acc, part) => acc + parseFloat(part.totalSpent), 0);

                return { ...subgroup, parts: partsWithExpenses, accumulatedBudget, accumulatedSpent };
            }));

            setSubgroups(subgroupsWithParts);
        } catch (error) {
            console.error('Error al obtener los detalles de la obra:', error);
        }
    };

    const fetchPartsWithExpenses = async (parts) => {
        return await Promise.all(parts.map(async (part) => {
            try {
                const response = await axiosInstance.get(`/expenses/parts/${part.id}/expenses`);
                const expenses = response.data;
                const totalSpent = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);

                return { ...part, totalSpent, expensesCount: expenses.length };
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    return { ...part, totalSpent: 0, expensesCount: 0 };
                }
                console.error('Error al obtener los gastos de la partida:', error);
                return { ...part, totalSpent: 0, expensesCount: 0 };
            }
        }));
    };

    const handleCreatePart = async (event) => {
        event.preventDefault();
        try {
            const newPart = {
                name: newPartName,
                budget: parseFloat(newPartBudget),
                subgroupId: selectedSubgroup || null,
                workId: id,
            };

            await axiosInstance.post(`/parts/${id}/parts`, newPart);
            setNewPartName('');
            setNewPartBudget('');
            setSelectedSubgroup('');
            fetchWorkDetails();
        } catch (error) {
            console.error('Error al crear la partida:', error);
        }
    };

    const handleCreateSubgroup = async (event) => {
        event.preventDefault();
        try {
            const newSubgroup = {
                name: newSubgroupName,
                budget: parseFloat(newSubgroupBudget),
                workId: id,
            };

            await axiosInstance.post(`/subgroups/${id}/subgroups`, newSubgroup);
            setNewSubgroupName('');
            setNewSubgroupBudget('');
            setIsSubgroupModalOpen(false);
            fetchWorkDetails();
        } catch (error) {
            console.error('Error al crear el subgrupo:', error);
        }
    };

    const formatNumber = (num) => {
        return parseFloat(num).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const goToPartDetail = (partId) => {
        navigate(`/parts/${partId}/detail`, {
            state: {
                userRole: user?.role,        // Pasamos el rol del usuario actual
                currentUserId: user?.id      // Pasamos el ID del usuario actual
            }
        });
    };

    // Calcula el presupuesto y los gastos totales para "Sin Categoría"
    const calculateUncategorizedTotals = () => {
        const totalBudget = uncategorizedParts.reduce((acc, part) => acc + parseFloat(part.budget), 0);
        const totalSpent = uncategorizedParts.reduce((acc, part) => acc + parseFloat(part.totalSpent), 0);

        return { totalBudget, totalSpent };
    };

    const uncategorizedTotals = calculateUncategorizedTotals();

    return (
        <div className="container mx-auto p-6">
            {work && (
                <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold">{work.name}</h2>
                    <p>Fecha de Inicio: {new Date(work.startDate).toLocaleDateString()}</p>
                    <p>Fecha de Fin: {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'No especificada'}</p>
                    <p>Presupuesto Total: ${formatNumber(work.totalBudget)}</p>
                </div>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <IconButton color="primary" onClick={() => setIsSubgroupModalOpen(true)}>
                    <AddIcon />
                </IconButton>

                <Tabs
                    value={value}
                    onChange={(e, newValue) => setValue(newValue)}
                    aria-label="subgroups tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {subgroups.map((subgroup, index) => (
                        <Tab key={subgroup.id} label={subgroup.name} />
                    ))}
                    {uncategorizedParts.length > 0 && (
                        <Tab label="Sin Categoría" />
                    )}
                </Tabs>
            </Box>

            {subgroups.map((subgroup, index) => (
                <TabPanel key={subgroup.id} value={value} index={index}>
                    <Typography variant="h6">
                        Presupuesto estimado: ${formatNumber(subgroup.budget)} | Gastado hasta ahora: ${formatNumber(subgroup.accumulatedBudget)}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Partida</TableCell>
                                    <TableCell>Presupuesto</TableCell>
                                    <TableCell>Monto Gastado</TableCell>
                                    <TableCell>Cantidad de Gastos</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subgroup.parts.map((part) => (
                                    <TableRow key={part.id}>
                                        <TableCell>{part.name}</TableCell>
                                        <TableCell>${formatNumber(part.budget)}</TableCell>
                                        <TableCell>${formatNumber(part.totalSpent)}</TableCell>
                                        <TableCell>{part.expensesCount} gastos</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => goToPartDetail(part.id)}
                                            >
                                                Ver Detalles
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            ))}

            {uncategorizedParts.length > 0 && (
                <TabPanel value={value} index={subgroups.length}>
                    <Typography variant="h6">
                        Presupuesto estimado: ${formatNumber(uncategorizedTotals.totalBudget)} | Gastado hasta ahora: ${formatNumber(uncategorizedTotals.totalSpent)}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Partida</TableCell>
                                    <TableCell>Presupuesto</TableCell>
                                    <TableCell>Monto Gastado</TableCell>
                                    <TableCell>Cantidad de Gastos</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {uncategorizedParts.map((part) => (
                                    <TableRow key={part.id}>
                                        <TableCell>{part.name}</TableCell>
                                        <TableCell>${formatNumber(part.budget)}</TableCell>
                                        <TableCell>${formatNumber(part.totalSpent)}</TableCell>
                                        <TableCell>{part.expensesCount} gastos</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => goToPartDetail(part.id)}
                                            >
                                                Ver Detalles
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            )}

            <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
                <h3 className="text-xl font-bold mb-4">Crear Nueva Partida</h3>
                <form onSubmit={handleCreatePart}>
                    <div className="mb-4">
                        <TextField
                            label="Nombre de la Partida"
                            variant="outlined"
                            fullWidth
                            value={newPartName}
                            onChange={(e) => setNewPartName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <TextField
                            label="Presupuesto"
                            variant="outlined"
                            fullWidth
                            type="number"
                            value={newPartBudget}
                            onChange={(e) => setNewPartBudget(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="subgroup-select-label">Categoría</InputLabel>
                            <Select
                                labelId="subgroup-select-label"
                                value={selectedSubgroup}
                                onChange={(e) => setSelectedSubgroup(e.target.value)}
                                label="Subgrupo"
                            >
                                <MenuItem value="">
                                    <em>Sin Categoría</em>
                                </MenuItem>
                                {subgroups.map((subgroup) => (
                                    <MenuItem key={subgroup.id} value={subgroup.id}>
                                        {subgroup.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="flex items-center justify-between">
                        <Button type="submit" variant="contained" color="primary">
                            Crear Partida
                        </Button>
                    </div>
                </form>
            </div>

            <Modal open={isSubgroupModalOpen} onClose={() => setIsSubgroupModalOpen(false)}>
                <div className="bg-white p-6 rounded-lg shadow-lg mt-6" style={{ margin: '10% auto', width: '400px' }}>
                    <h3 className="text-xl font-bold mb-4">Crear Nueva Categoría</h3>
                    <form onSubmit={handleCreateSubgroup}>
                        <div className="mb-4">
                            <TextField
                                label="Nombre de la Categoría"
                                variant="outlined"
                                fullWidth
                                value={newSubgroupName}
                                onChange={(e) => setNewSubgroupName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <TextField
                                label="Presupuesto"
                                variant="outlined"
                                fullWidth
                                type="number"
                                value={newSubgroupBudget}
                                onChange={(e) => setNewSubgroupBudget(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button type="submit" variant="contained" color="primary">
                                Crear Categoría
                            </Button>
                            <Button onClick={() => setIsSubgroupModalOpen(false)} variant="contained" color="secondary">
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default WorkDetail;
