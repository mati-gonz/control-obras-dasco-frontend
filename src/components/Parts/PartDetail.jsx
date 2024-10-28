import { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TextField, InputLabel, Modal, Box
} from '@mui/material';
import { format } from 'date-fns';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const formatNumberWithDots = (number) => {
  return number.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatNumber = (num) => parseFloat(num).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const downloadReceipt = async (expenseId, download = false) => {
  try {
    const response = await axiosInstance.get(`/expenses/${expenseId}/receipt`);
    const signedUrl = response.data.signedUrl;
    const fileExtension = response.data.fileExtension;

    if (download) {
      const blobResponse = await fetch(signedUrl);
      const blob = await blobResponse.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-${expenseId}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (fileExtension === 'pdf') {
      window.open(signedUrl, '_blank');
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      return signedUrl;
    } else {
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = `recibo-${expenseId}.${fileExtension}`;
      a.click();
    }
  } catch (error) {
    console.error('Error obteniendo el recibo:', error);
    return null;
  }
};

const saveExpense = async (expenseData, isEditMode, partId, selectedExpenseId) => {
  try {
    if (isEditMode) {
      await axiosInstance.put(`/expenses/${selectedExpenseId}`, expenseData, {
      });
    } else {
      await axiosInstance.post(`/expenses/parts/${partId}/expenses`, expenseData, {
      });
    }
  } catch (error) {
    console.error('Error al guardar el gasto:', error);
  }
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
  const [formattedAmount, setFormattedAmount] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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

    if (name === 'amount') {
      const formattedValue = formatNumberWithDots(value);
      setFormattedAmount(formattedValue);
      setNewExpense({
        ...newExpense,
        amount: value.replace(/\./g, '')
      });
    } else {
      setNewExpense({
        ...newExpense,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewExpense({
      ...newExpense,
      receipt: file,
    });
  };

  const handleEditExpense = (expense) => {
    setIsEditMode(true);
    setSelectedExpenseId(expense.id);

    const formattedDate = expense.date.slice(0, 10);

    setNewExpense({
      amount: expense.amount,
      description: expense.description,
      date: formattedDate,
      receipt: null,
    });

    setIsModalOpen(true);
  };

const handleSaveExpense = async (e) => {
  e.preventDefault();
  let formData = new FormData();

  formData.append('amount', newExpense.amount);
  formData.append('description', newExpense.description);
  formData.append('date', newExpense.date);
  formData.append('userId', currentUserId);

  if (newExpense.receipt) {
    formData.append('receipt', newExpense.receipt);
  }

  await saveExpense(formData, isEditMode, partId, selectedExpenseId);

  setIsModalOpen(false);
  setIsEditMode(false);
  setNewExpense({
    amount: '',
    description: '',
    date: '',
    receipt: null,
  });
  fetchPartDetails();
};


  const handleDeleteExpense = async (expenseId) => {
    try {
      await axiosInstance.delete(`/expenses/expenses/${expenseId}`);
      fetchPartDetails();
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
                <TableCell>{expense.User?.name || 'Desconocido'}</TableCell>
                <TableCell>
                  {expense.receiptUrl ? (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
                          const url = await downloadReceipt(expense.id);
                          setReceiptUrl(url);
                          setIsImageModalOpen(true);
                        }}
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

      <div className="flex justify-start mt-6">
          <button
              onClick={() => navigate(`/work/${part.workId}/details`)}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition duration-200"
          >
              Volver
          </button>
      </div>

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
                name="amount"
                value={formattedAmount}
                onChange={handleInputChange}
                required
              />
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
                inputProps={{ max: new Date().toISOString().split("T")[0] }}
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
