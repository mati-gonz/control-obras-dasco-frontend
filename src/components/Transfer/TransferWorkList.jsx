import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axiosInstance from '../../services/axiosInstance';
import { useAuth } from '../../context/useAuth';

const TransferWorkList = () => {
    const { userId } = useParams();
    const [works, setWorks] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchWorks = async () => {
        try {
            const endpoint = user.role === 'admin'
                ? `/transfers/works`
                : `/transfers/works/${userId}`;

            const response = await axiosInstance.get(endpoint);
            setWorks(response.data);
        } catch (error) {
            console.error('Error al obtener las obras:', error);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, [userId, user.role]);

    const handleViewDetail = (workId) => {
        navigate(`/transfers/user/${userId}/work/${workId}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="container mx-auto px-4 lg:px-8">
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre de la Obra</TableCell>
                                    <TableCell align="center">Balance</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {works.map((work) => (
                                    <TableRow key={work.workId}>
                                        <TableCell>{work.workName}</TableCell>
                                        <TableCell align="center">${work.balance.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleViewDetail(work.workId)}
                                            >
                                                Ver Detalle
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </div>
        </div>
    );
};

export default TransferWorkList;
