import { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import axios from 'axios'; // Se añade axios para manejar la subida del archivo a cPanel
import { useParams, useLocation } from 'react-router-dom';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, InputLabel, Modal, Box
} from '@mui/material';
import { format } from 'date-fns';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const PartDetail = () => {
  const { partId } = useParams();
  const location = useLocation();
  const { userRole, currentUserId } = location.state || {};
  const [part, setPart] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    date: '',
    receipt: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const downloadReceipt = async (expenseId, download = false) => {
    try {
      const receiptUrl = `https://dasco.cl/dasco_receipts/recibo-${expenseId}.gz`;
  
      if (download) {
        const a = document.createElement('a');
        a.href = receiptUrl;
        a.download = `recibo-${expenseId}`;
        a.click();
      } else if (receiptUrl.endsWith(".pdf")) {
        window.open(receiptUrl, '_blank');
      } else if (receiptUrl.match(/\.(jpg|jpeg|png)$/)) {
        setReceiptUrl(receiptUrl);
        setIsImageModalOpen(true);
      } else {
        const a = document.createElement('a');
        a.href = receiptUrl;
        a.download = `recibo-${expenseId}`;
        a.click();
      }
    } catch (error) {
      console.error('Error descargando el recibo:', error);
    }
  };
  
  const fetchPartDetails = async () => {
    try {
      const partResponse = await axiosInstance.get(`/parts/${partId}`);
      const expensesResponse = await axiosInstance.get(`/expenses/parts/${partId}/expenses`);

      setPart(partResponse.data);
      setExpenses(expensesResponse.data);
    } catch (error) {
      console.error('Error al obtener los detalles de la partida:', error);
    }
  };

  useEffect(() => {
    fetchPartDetails();
  }, [partId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewExpense({
        ...newExpense,
        receipt: file,
      });
    } else {
      console.error('No se ha seleccionado ningún archivo');
    }
  };

  const handleEditExpense = (expense) => {
    setIsEditMode(true);
    setSelectedExpenseId(expense.id);
    setNewExpense({
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      receipt: null,
    });
    setIsModalOpen(true);
  };

  // Modificación para subir archivos al servidor cPanel y guardar los datos en el backend
  const handleSaveExpense = async (e) => {
    e.preventDefault();

    try {
      let fileUrl = null;

      // Si se ha seleccionado un archivo, lo subimos al servidor cPanel
      if (newExpense.receipt) {
        const formData = new FormData();
        formData.append('file', newExpense.receipt);

        // Subir archivo al servidor cPanel usando el endpoint PHP
        const uploadResponse = await axios.post('https://dasco.cl/upload/upload.php', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.data.status === 'success') {
          // Almacenar la URL del archivo subido
          fileUrl = uploadResponse.data.fileUrl;
        } else {
          throw new Error(uploadResponse.data.message || 'Error al subir el archivo');
        }
      }

      // Preparar los datos para enviar al backend de Node.js
      const expenseData = {
        amount: newExpense.amount,
        description: newExpense.description,
        date: newExpense.date,
        receiptUrl: fileUrl, // Guardamos la URL del recibo si se subió uno
      };

      if (isEditMode) {
        // Actualizar el gasto existente
        await axiosInstance.put(`/expenses/expenses/${selectedExpenseId}`, expenseData);
      } else {
        // Crear nuevo gasto
        await axiosInstance.post(`/expenses/parts/${partId}/expenses`, expenseData);
      }

      // Reiniciar los campos del formulario
      setNewExpense({
        amount: '',
        description: '',
        date: '',
        receipt: null,
      });

      setIsModalOpen(false);
      setIsEditMode(false);
      fetchPartDetails(); // Recargar detalles de la partida y los gastos
    } catch (error) {
      console.error('Error al guardar el gasto:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axiosInstance.delete(`/expenses/expenses/${expenseId}`);
      fetchPartDetails(); // Actualizar la lista de gastos después de eliminar
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
    }
  };

  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="container mx-auto p-6">
      {part && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <Typography variant="h4" gutterBottom>
            {part.name}
          </Typography>
          <Typography variant="body1">
            Presupuesto: ${formatNumber(part.budget)}
          </Typography>
        </div>
      )}

      <Typography variant="h5" gutterBottom>
        Gastos asociados
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Monto</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Recibo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>${formatNumber(expense.amount)}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{expense.user?.name || 'Desconocido'}</TableCell>
                <TableCell>
                  {expense.receiptUrl ? (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => downloadReceipt(expense.id)}
                      >
                        Ver Recibo
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ ml: 1 }}
                        onClick={() => downloadReceipt(expense.id, true)}
                      >
                        Descargar
                      </Button>
                    </>
                  ) : (
                    'No disponible'
                  )}
                </TableCell>
                <TableCell>
                  {(userRole === 'admin' || currentUserId === expense.userId) && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mr: 1 }}
                        onClick={() => handleEditExpense(expense)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)} sx={{ mt: 3 }}>
        Agregar Gasto
      </Button>

      {/* Modal para crear o editar un gasto */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6" style={{ margin: '10% auto', width: '400px' }}>
          <Typography variant="h5" gutterBottom>
            {isEditMode ? 'Editar Gasto' : 'Nuevo Gasto'}
          </Typography>
          <form onSubmit={handleSaveExpense}>
            <div className="mb-4">
              <TextField
                label="Monto"
                variant="outlined"
                fullWidth
                type="number"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <TextField
                label="Descripción"
                variant="outlined"
                fullWidth
                name="description"
                value={newExpense.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <TextField
                label="Fecha"
                variant="outlined"
                fullWidth
                type="date"
                name="date"
                value={newExpense.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: new Date().toISOString().split("T")[0] // Limitamos hasta el día de hoy
                }}
                required
              />
            </div>
            <div className="mb-4">
              <InputLabel htmlFor="receipt">Subir Recibo</InputLabel>
              <input
                id="receipt"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button type="submit" variant="contained" color="primary">
                {isEditMode ? 'Guardar Cambios' : 'Agregar Gasto'}
              </Button>
              <Button onClick={() => setIsModalOpen(false)} variant="contained" color="secondary">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal para mostrar la imagen */}
      <Modal open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
        <Box sx={{
          margin: '5% auto',
          padding: 3,
          backgroundColor: 'white',
          width: '80%',
          textAlign: 'center',
          boxShadow: 24,
          outline: 'none',
          overflow: 'hidden'
        }}>
          <Typography variant="h6">Recibo</Typography>
          {receiptUrl && (
            <Zoom>
              <img src={receiptUrl} alt="Recibo" style={{ maxWidth: '100%', height: 'auto', cursor: 'zoom-in' }} />
            </Zoom>
          )}
          <Button variant="contained" color="secondary" onClick={() => setIsImageModalOpen(false)} sx={{ mt: 2 }}>
            Cerrar
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default PartDetail;
