import { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { useParams, useLocation } from 'react-router-dom';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, InputLabel, Modal, Box
} from '@mui/material';
import { format } from 'date-fns';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// Utilidad para formatear números
const formatNumber = (num) => parseFloat(num).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Utilidad para formatear números
const downloadReceipt = async (expenseId, download = false) => {
  try {
    // Obtener la URL firmada y la extensión del archivo desde el backend
    const response = await axiosInstance.get(`/expenses/${expenseId}/receipt`);
    const signedUrl = response.data.signedUrl;
    const fileExtension = response.data.fileExtension; // Obtenemos la extensión del archivo

    // Si es descarga, realizar la solicitud del archivo con fetch
    if (download) {
      const blobResponse = await fetch(signedUrl); // Hacer la solicitud de descarga con fetch
      const blob = await blobResponse.blob(); // Obtener el blob del archivo

      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-${expenseId}.${fileExtension}`; // Usar la extensión aquí
      document.body.appendChild(a); // Añadir el enlace temporal al cuerpo
      a.click(); // Simular un clic en el enlace para iniciar la descarga
      document.body.removeChild(a); // Eliminar el enlace del DOM
      window.URL.revokeObjectURL(url); // Revocar el objeto URL para liberar memoria
    } else if (fileExtension === 'pdf') {
      window.open(signedUrl, '_blank'); // Abrir PDF en una nueva pestaña
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      return signedUrl; // Devolver la URL para usarla en una imagen
    } else {
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = `recibo-${expenseId}.${fileExtension}`; // Descargar el archivo con la extensión correcta
      a.click();
    }
  } catch (error) {
    console.error('Error obteniendo el recibo:', error);
    return null;
  }
};

// Función para manejar la creación o actualización de gastos
const saveExpense = async (expenseData, isEditMode, partId, selectedExpenseId) => {
  try {
    if (isEditMode) {
      // Actualizar el gasto existente
      await axiosInstance.put(`/expenses/expenses/${selectedExpenseId}`, expenseData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Crear un nuevo gasto
      await axiosInstance.post(`/expenses/parts/${partId}/expenses`, expenseData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  } catch (error) {
    console.error('Error al guardar el gasto:', error);
  }
};

const formatDateToChileTimezone = (date) => {
  const localDate = new Date(date);
  localDate.setHours(localDate.getHours() - 3);  // Ajustar la diferencia horaria de UTC-3
  return localDate.toISOString().split("T")[0];  // Obtener solo la fecha "yyyy-MM-dd"
};


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

  // Función para obtener los detalles de la partida
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

  // Función para manejar cambios en los campos de entrada
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value,
    });
  };

  // Función para manejar cambios en el archivo seleccionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewExpense({
      ...newExpense,
      receipt: file,
    });
  };

  // Función para abrir el modal de edición
  const handleEditExpense = (expense) => {
    setIsEditMode(true);
    setSelectedExpenseId(expense.id);
  
    // Formatear la fecha correctamente al horario de Chile (UTC-3)
    const formattedDate = formatDateToChileTimezone(expense.date);
  
    setNewExpense({
      amount: expense.amount,
      description: expense.description,
      date: formattedDate,  // Asignar la fecha formateada
      receipt: null,
    });
  
    setIsModalOpen(true);
  };
  

  // Función para manejar la creación o edición de un gasto
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    let formData = new FormData();

    formData.append('amount', newExpense.amount);
    formData.append('description', newExpense.description);
    formData.append('date', newExpense.date);
    formData.append('userId', currentUserId); // Agregar el userId al FormData

    // Añadir archivo si está presente
    if (newExpense.receipt) {
      formData.append('receipt', newExpense.receipt);
    }

    // Guardar el gasto (crear o actualizar)
    await saveExpense(formData, isEditMode, partId, selectedExpenseId);

    setIsModalOpen(false);
    setIsEditMode(false);
    setNewExpense({
      amount: '',
      description: '',
      date: '',
      receipt: null,
    });
    fetchPartDetails(); // Recargar detalles de la partida y los gastos
  };

  // Función para eliminar un gasto
  const handleDeleteExpense = async (expenseId) => {
    try {
      await axiosInstance.delete(`/expenses/expenses/${expenseId}`);
      fetchPartDetails(); // Recargar detalles de los gastos
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
    }
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
                <TableCell>{expense.User?.name || 'Desconocido'}</TableCell> {/* Mostrar el nombre del usuario */}
                <TableCell>
                  {expense.receiptUrl ? (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
                          const url = await downloadReceipt(expense.id);
                          setReceiptUrl(url); // Almacena la URL para mostrar en el modal
                          setIsImageModalOpen(true); // Abre el modal
                        }}
                      >
                        Ver Recibo
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ ml: 1 }}
                        onClick={() => downloadReceipt(expense.id, true)} // Descargar archivo
                      >
                        Descargar
                      </Button>
                    </>
                  ) : 'No disponible'}
                </TableCell>
                <TableCell>
                  {(userRole === 'admin' || currentUserId === expense.userId) && (
                    <>
                      <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleEditExpense(expense)}>
                        Editar
                      </Button>
                      <Button variant="contained" color="error" onClick={() => handleDeleteExpense(expense.id)}>
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
              <TextField label="Monto" variant="outlined" fullWidth type="number" name="amount" value={newExpense.amount} onChange={handleInputChange} required />
            </div>
            <div className="mb-4">
              <TextField label="Descripción" variant="outlined" fullWidth name="description" value={newExpense.description} onChange={handleInputChange} />
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
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: formatDateToChileTimezone(new Date()) }}  // Ajustar el valor máximo a UTC-3
                required
              />
            </div>

            <div className="mb-4">
              <InputLabel htmlFor="receipt">Subir Recibo</InputLabel>
              <input id="receipt" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
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
