import { useState } from 'react';
import { Modal, Box, Button, TextField, Typography } from '@mui/material';
import axiosInstance from '../../services/axiosInstance';  // Usar axiosInstance para manejar el token automáticamente

const ChangePasswordModal = ({ open, handleClose, userId }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await axiosInstance.put(`/users/${userId}`, {
        currentPassword,
        password: newPassword,
      });
      setSuccess('Contraseña actualizada con éxito');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Error al actualizar la contraseña. Verifica tu contraseña actual.');
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        backgroundColor: 'white',
        padding: 4,
        margin: '10% auto',
        maxWidth: 400,
        boxShadow: 24,
        borderRadius: 2
      }}>
        <Typography variant="h6" gutterBottom>
          Cambiar Contraseña
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success">{success}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Contraseña Actual"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <TextField
            label="Nueva Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirmar Nueva Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button onClick={handleClose} color="secondary">Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Cambiar</Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default ChangePasswordModal;
