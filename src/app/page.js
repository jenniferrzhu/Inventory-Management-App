'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material' 
import { createTheme, ThemeProvider, styled } from '@mui/material/styles'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore' 
import { StyledEngineProvider } from '@mui/material/styles';

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity === 1){
        await deleteDoc(docRef)
      }
      else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){ 
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    }
    else {
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false) 

  const theme = createTheme({
    palette: {
      color: {
        background: '#e0a15a',
        dark: '#552910',
        redBrown: '#863a14',
        medium: '#9b5f39',
        white: 'ffffff'
      },
    },
  });

  const StyledButton = styled(Button)(({ theme, color = 'primary' }) => ({
    ':hover': { 
      backgroundColor: '#863a14',
      color: '#ffffff'
    },
  }));

  return ( 
    <StyledEngineProvider injectFirst>
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        }}
      >
        {/* Background Image Box */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/background/20230613/pngtree-an-illustration-of-a-pantry-with-pots-and-dishes-image_2891465.jpg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1,  
            opacity: 0.75
          }}
        />
        <Box bgcolor="#e0a15a" maxWidth="75%" maxHeight="75%" display={'flex'} flexDirection="column" justifyContent={'center'} alignItems={'center'} position="relative" top="50%" left="50%" borderRadius="10%" sx={{
          transform: "translate(-50%, -50%)", opacity: 0.95, zIndex: 0
        }}> 
        
          {/* Overlay Content */}
          <Box
            width="100%"
            height="100%"
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            gap={2}
            sx={{ position: 'relative', zIndex: 1 }}  
          >
            <Modal open={open} onClose={handleClose}>
              <Box 
                position="absolute"
                top="50%"
                left="50%"
                width={400}
                bgcolor="white"
                border="2px solid #000"
                boxShadow={24}
                p={4}
                display={"flex"}
                flexDirection='column'
                gap={3}
                sx={{
                  transform: "translate(-50%, -50%)",
                  borderRadius: "5%"
                }}
              >
                <Typography variant="h6">Add Item</Typography>
                <Stack width="100%" direction="row" spacing={2}>
                  <TextField 
                    variant='outlined'
                    fullWidth
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value);
                    }}
                  /> 
                  <ThemeProvider theme={theme}> 
                    <StyledButton sx={{ bgcolor: 'color.dark', }} variant="contained" onClick={() => {
                      addItem(itemName);
                      setItemName('');
                      handleClose();
                    }}>
                      Add
                    </StyledButton>
                  </ThemeProvider>
                </Stack>
              </Box>
            </Modal>
            <Box sx={{
              position: 'relative',  
              zIndex: 2  
            }}>
              <ThemeProvider theme={theme}> 
                <StyledButton variant="contained" sx={{ bgcolor: 'color.dark', width: '3rem', height: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10%', position: 'fixed', top: '2rem', right: '3rem', zIndex: 10}} onClick={handleOpen}
                  border="none"
                > 
                  +
                </StyledButton>
              </ThemeProvider>
            </Box>

            <Box width="100%" display="flex" flexDirection="column" alignItems="center" marginTop="50px" px={2}>
                <Typography variant='h2' fontWeight={400} mb={2}>
                  Pantry Items
                </Typography>
                
                <Box
                  width="100%"
                  maxWidth="600px"
                  maxHeight="50vh"  
                  overflow="auto" 
                  borderRadius="10px" 
                  p={2}
                >
                  <Stack spacing={2}>
                    {inventory.map(({ name, quantity }) => (
                      <Box key={name} width="100%" minHeight="120px" display="flex"
                        alignItems={'center'} justifyContent={'space-between'} padding={2} borderRadius="8px"
                      >
                        <Typography variant="h3" textAlign={'center'}>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Typography> 
                        <Stack direction="row" spacing={2}>
                        <ThemeProvider theme={theme}> 
                          <StyledButton sx={{ bgcolor: 'color.dark', }} variant="contained" onClick={() => {
                            addItem(name);
                          }}>
                            +
                          </StyledButton>
                        </ThemeProvider>
                          <Typography variant="h3" textAlign={'center'}>
                          {quantity}
                          </Typography>
                        <ThemeProvider theme={theme}> 
                          <StyledButton sx={{ bgcolor: 'color.dark', }} variant="contained" onClick={() => {
                            removeItem(name);
                          }}>
                            —
                          </StyledButton>
                        </ThemeProvider> 
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
            </Box>
          </Box>
        </Box>
      </Box> 
    </StyledEngineProvider>
  )
}