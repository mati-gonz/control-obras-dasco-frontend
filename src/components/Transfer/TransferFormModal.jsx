import { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 1,
    boxShadow: 24,
    p: 4,
};

const TransferFormModal = ({ open, onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [formattedAmount, setFormattedAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');

    const formatNumberWithDots = (number) => {
        return number.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setFormattedAmount(formatNumberWithDots(value));
        setAmount(value.replace(/\./g, ''));
    };

    const handleSubmit = () => {
        onSubmit({ amount: parseFloat(amount), date, description });
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-title" variant="h6" component="h2">
                    Registrar Nueva Transferencia
                </Typography>
                <TextField
                    label="Monto"
                    type="text"
                    fullWidth
                    margin="normal"
                    value={formattedAmount}
                    onChange={handleAmountChange}
                />
                <TextField
                    label="Fecha"
                    type="date"
                    fullWidth
                    margin="normal"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <TextField
                    label="Descripción"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleSubmit}
                >
                    Guardar
                </Button>
            </Box>
        </Modal>
    );
};

export default TransferFormModal;
