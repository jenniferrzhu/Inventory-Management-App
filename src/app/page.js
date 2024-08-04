'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
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
  const [open, setOpen] = useState([])
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
        
        {/* Overlay Content */}
        <Box
          width="100vw"
          height="100vh"
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
                transform: "translate(-50%, -50%)"
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
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    addItem(itemName);
                    setItemName('');
                    handleClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Button variant="contained" sx={{ width: '3rem', height: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }} onClick={handleOpen}>
            +
          </Button>
          <Box border="1px solid #333">
            <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
              <Typography variant='h2' color="#333">
                Inventory Items
              </Typography>
            </Box>
            <Box width="800px" maxHeight="300px" overflow="auto"> 
            <Stack spacing={2}>
              {inventory.map(({ name, quantity }) => (
                <Box key={name} width="100%" minHeight="150px" display="flex"
                  alignItems={'center'} justifyContent={'space-between'} bgColor="f0f0f0" padding={5}
                >
                  <Typography variant="h3" color="#333" textAlign={'center'}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#333" textAlign={'center'}>
                    {quantity}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={() => {
                      addItem(name);
                    }}>
                      Add
                    </Button>
                    <Button variant="contained" onClick={() => {
                      removeItem(name);
                    }}>
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </StyledEngineProvider>
  )
}
