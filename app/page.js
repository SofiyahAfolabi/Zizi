'use client'
import { Box, Button, Stack, TextField, ThemeProvider, createTheme, Typography} from '@mui/material'
import Image from "next/image";
import { useState, useRef, useEffect } from 'react'; 
import ReactMarkdown from 'react-markdown';


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Zizi's International Student Support! 🌟 Your go-to guide for navigating life in the US as an international student. Whether you need help with CPT, OPT, visas, taxes, or finding essential services, I've got you covered! 😊 Let’s make your journey easier, how can I assist you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [showHeading, setShowHeading] = useState(true); // New state to track heading visibility

  const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
    // We'll implement this function in the next section
    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
    ])

    // Send the message to the server
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()  // Get a reader to read the response body
      const decoder = new TextDecoder()  // Create a decoder to decode the response text

      let result = ''
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
          ]
        })
        return reader.read().then(processText)  // Continue reading the next chunk of the response
      })
    })
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const theme = createTheme({
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: '#cfcbca',
            borderRadius: '4px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: 'skyblue',
            '&:hover': {
              backgroundColor: 'darkblue',
            },
          },
        },
      },
    },
  });



  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        bgcolor="black"
        flexDirection="column"
        alignItems="center"
        overflow="hidden" // Prevent scrolling on the entire page
        position="relative"
        sx={{
          backgroundImage: "url('/Flags.png')", // Correctly formatted
          backgroundSize: 'cover',
        }}
      >      
      {showHeading && (
        <Typography
          // variant="h1"
          sx={{
            color: 'white',
            fontSize: {
              xs: '18px', // font size for small screens (mobile)
              sm: '45px', // font size for larger screens (tablet and up)
            },
            fontFamily: 'Mina',
            position: 'fixed',
            mt: '20px',
            // zIndex: 1, // Ensure it's on top of other elements
          }}
        >
          Welcome to ZiZi ChatBot 🤖
        </Typography>
      )}

      
      <Stack
        direction={'column'}
        width= {{xs:"50%", sm:"40%"}}  //width by screene
        height="700px"
        border="1px solid white"
        bgcolor={'white'}
        p={2}
        spacing={3}
        mt={10}
        mb={5}

      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
                sx={{whiteSpace: 'pre-wrap'}}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
                
              </Box>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            multiline
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default Enter behavior (new line)
                sendMessage(); // Send the message
              }
            }}
            disabled={isLoading}
            />
              
              <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
    </ThemeProvider>

  )







}