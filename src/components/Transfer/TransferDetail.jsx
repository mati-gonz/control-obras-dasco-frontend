import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/useAuth';
import TransferFormModal from './TransferFormModal';

const TransferDetail = () => {
    const { userId, workId } = useParams();
    const { user } = useAuth();
    const [transfers, setTransfers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [parts, setParts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTransfers = async () => {
        try {
            const params = user.role === 'admin' ? { workId } : { userId, workId };
    
            const response = await axiosInstance.get(`/transfers/byUserWork`, {
                params,
            });
            setTransfers(response.data);
        } catch (error) {
            console.error('Error al obtener las transferencias:', error);
        }
    };

    const fetchParts = async () => {
        try {
            const response = await axiosInstance.get(`/parts/${workId}/parts`);
            setParts(response.data.data);
        } catch (error) {
            console.error('Error al obtener las partidas:', error);
        }
    };

    const fetchExpenses = async (partId) => {
        try {
            const response = await axiosInstance.get(`/expenses/parts/${partId}/expenses`);
            setExpenses((prevExpenses) => {
                const newExpenses = response.data.filter(
                    (newExpense) => !prevExpenses.some((expense) => expense.id === newExpense.id)
                );
                return [...prevExpenses, ...newExpenses];
            });
        } catch (error) {
            console.error('Error al obtener los gastos:', error);
        }
    };

    useEffect(() => {
        fetchTransfers();
        fetchParts();
    }, [userId, workId]);

    useEffect(() => {
        if (parts.length > 0) {
            parts.forEach((part) => fetchExpenses(part.id));
        }
    }, [parts]);

    const formatNumberWithDots = (number) => {
        return Math.floor(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const totalTransferido = formatNumberWithDots(
        transfers.reduce((acc, transfer) => acc + (Number(transfer.amount) || 0), 0)
    );
    const totalGastado = formatNumberWithDots(
        expenses.reduce((acc, expense) => acc + (Number(expense.amount) || 0), 0)
    );

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleRegisterTransfer = async (newTransfer) => {
        try {
            await axiosInstance.post('/transfers', {
                ...newTransfer,
                userId,
                workId,
            });
            fetchTransfers();
        } catch (error) {
            console.error('Error al registrar la transferencia:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="container mx-auto px-4 lg:px-8">
                <Paper sx={{ padding: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        Detalle de Transferencias y Gastos para la Obra
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        Transferencias | Total transferido: ${totalTransferido}
                    </Typography>
                    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Monto</TableCell>
                                    <TableCell>Descripción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transfers.map((transfer) => (
                                    <TableRow key={transfer.id}>
                                        <TableCell>{new Date(transfer.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            ${formatNumberWithDots(transfer.amount || 0)}
                                        </TableCell>
                                        <TableCell>{transfer.description || "Sin descripción"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="h6" gutterBottom>
                        Gastos | Total gastado: ${totalGastado}
                    </Typography>
                    <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Monto</TableCell>
                                    <TableCell>Descripción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            ${formatNumberWithDots(expense.amount || 0)}
                                        </TableCell>
                                        <TableCell>{expense.description || "Sin descripción"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {user?.role === 'admin' && (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenModal}
                            >
                                Registrar Transferencia
                            </Button>
                            <TransferFormModal
                                open={isModalOpen}
                                onClose={handleCloseModal}
                                onSubmit={handleRegisterTransfer}
                            />
                        </>
                    )}
                </Paper>
            </div>
        </div>
    );
};

export default TransferDetail;
