import React, { useState } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Modal,
  Toolbar,
  Typography,
} from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ModalSettings from './modal/settings';
import ModalInfo from './modal/info';
import { useAtom } from 'jotai';
import { useInfoModalState } from './states';

export default function Header() {
  const [openSettings, setOpenSettings] = useState(false);
  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);

  const [openInfo, setOpenInfo] = useAtom(useInfoModalState);
  const handleOpenInfo = () => setOpenInfo(true);
  const handleCloseInfo = () => setOpenInfo(false);

  return (
    <>
      <AppBar position="static">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconButton
            color="inherit"
            aria-label="Info"
            sx={{ flexBasis: '2%' }}
            onClick={handleOpenInfo}
          >
            <HelpOutlineOutlinedIcon />
          </IconButton>
          <Typography
            variant="h1"
            color="inherit"
            fontSize="2rem"
            align="center"
            sx={{ flexBasis: '96%' }}
          >
            WOR<span style={{ color: 'yellow' }}>3D</span>LE
          </Typography>
          <IconButton
            color="inherit"
            aria-label="Setting"
            sx={{ flexBasis: '2%' }}
            onClick={handleOpenSettings}
          >
            <SettingsOutlinedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <ModalSettings open={openSettings} handleClose={handleCloseSettings} />
      <ModalInfo open={openInfo} handleClose={handleCloseInfo} />
    </>
  );
}
