import { useState } from 'react';
import { Modal, Box, Button, TextField, Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Importamos los íconos para el ojo
import axiosInstance from '../../services/axiosInstance';

const ChangePasswordModal = ({ open, handleClose, userId }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Para alternar visibilidad de la contraseña actual
  const [showNewPassword, setShowNewPassword] = useState(false); // Para alternar visibilidad de la nueva contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Para alternar visibilidad de la confirmación de contraseña

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
      handleClose(); // Cerrar el modal después de actualizar la contraseña exitosamente
    } catch (error) {
      setError('Error al actualizar la contraseña. Verifica tu contraseña actual.');
      console.error(error);
    }
  };

  const toggleShowPassword = (setShow) => {
    setShow((show) => !show);
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
            type={showCurrentPassword ? "text" : "password"} // Cambiar entre mostrar texto o asteriscos
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword(setShowCurrentPassword)}
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Nueva Contraseña"
            type={showNewPassword ? "text" : "password"} // Cambiar entre mostrar texto o asteriscos
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword(setShowNewPassword)}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Confirmar Nueva Contraseña"
            type={showConfirmPassword ? "text" : "password"} // Cambiar entre mostrar texto o asteriscos
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword(setShowConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
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
