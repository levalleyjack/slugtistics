import {
  Card,
  Box,
  Typography,
  IconButton,
  Theme,
  TextField,
  Tooltip,
  useTheme,
  Fade,
  Grow,
  Button,
} from "@mui/material";
import {
  PictureAsPdf,
  Description,
  InsertDriveFile,
  DeleteOutline,
  Send,
  AttachFile,
  Close,
} from "@mui/icons-material";
import {
  ALLOWED_TYPES,
  ChatHeaderProps,
  ChatInputProps,
  COLORS,
  FileViewProps,
  Message,
  MessageListProps,
} from "../Constants";
import { useRef, useState } from "react";
import "../App.css";
import { useMutation } from "@tanstack/react-query";

{
  /* Main function, this is where the entire chatbot functionality is happening*/
}
export const Chatbot: React.FC = () => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  {
    /* Updated mutation hook with improved error handling */
  }
  const { mutate: recommendClass, isError } = useMutation({
    mutationFn: async (data: { file: File; preferences?: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);

      // Append preferences if provided
      if (data.preferences) {
        formData.append("preferences", data.preferences);
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/recommend_class", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.recommended_class;
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
  });

  const [selectedFile, setSelectedFile] = useState<Message["file"]>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  {
    /* Greeting message from bot */
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi, I'm Slugsy! Put in your transcript and let's find you a class!",
      isBot: true,
    },
  ]);

  {
    /* Enhanced function for sending message with proper file handling and loading states */
  }
  const handleSendMessage = async () => {
    if (!selectedFile?.actual_file) return;

    //Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      file: selectedFile,
    };
    setMessages((prev) => [...prev, userMessage]);

    //loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: "Analyzing your transcript...",
      isBot: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const preferences = inputMessage; //using inputMessage as preferences

      recommendClass(
        { file: selectedFile.actual_file, preferences },
        {
          onSuccess: (data) => {

            const recommendations = data.recommendations;
            const formattedText = recommendations.map((rec, index) => {
              return `Recommendation ${index + 1}:
              Course Code: ${rec.course_code}
              Ratings: ${rec.gpa}
              Instructor: ${rec.instructor}
              Reason: ${rec.reason}`;
            }).join("\n\n");
            

            setMessages((prev) => [
              ...prev.filter((msg) => msg.id !== loadingMessage.id),
              {
                id: Date.now() + 2,
                text: `${formattedText}`,
                isBot: true,
              },
            ]);
          },
          onError: (error) => {
            setMessages((prev) => [
              ...prev.filter((msg) => msg.id !== loadingMessage.id),
              {
                id: Date.now() + 2,
                text: "Sorry, there was an error processing your file. Please try again.",
                isBot: true,
              },
            ]);
            console.error("Error:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    }

    setInputMessage("");
    setSelectedFile(null);
  };

  {
    /* Checking if the file is pdf, doc, docx and under 5MB */
  }
  const handleFileValidation = (file: File) => {
    if (!file) return;

    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      alert(
        `Only ${Object.values(ALLOWED_TYPES).join(", ")} files are allowed.`
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    const fileUrl = URL.createObjectURL(file);

    setSelectedFile({
      name: file.name,
      type: file.type,
      size: file.size,
      url: fileUrl,
      actual_file: file,
    });
  };

  {
    /* Below are the drag/drop functionalities for the files */
  }
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileValidation(file);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile(null);
  };

  return (
    <div style={{ position: "fixed", bottom: 10, right: 10, zIndex: 1000 }}>
      <Grow
        in={chatOpen}
        timeout={200}
        style={{ transformOrigin: "bottom" }}
        unmountOnExit
      >
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            width: 350,
            height: 500,
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: theme.shadows[5],
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Dragging file overlay */}
          {isDragging && (
            <div
              role="region"
              aria-live="polite"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                borderRadius: "16px",
                border: `2px dashed ${theme.palette.primary.main}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <Typography
                variant="h6"
                color="primary"
                style={{ fontWeight: "bold", userSelect: "none" }}
              >
                Drop your file here
              </Typography>
            </div>
          )}
          {/* Slugsy header when chat opens */}
          <ChatHeader onClose={() => setChatOpen(false)} theme={theme} />
          {/* Shows the list of messages */}
          <MessageList messages={messages} theme={theme} />
          {/* This is where user can type out their preferences and put transcript, can also drag drop */}
          <ChatInput
            inputMessage={inputMessage}
            selectedFile={selectedFile}
            onMessageChange={(value) => setInputMessage(value)}
            onSendMessage={handleSendMessage}
            onFileClick={handleFileClick}
            onRemoveFile={handleRemoveFile}
            theme={theme}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />
        </div>
      </Grow>
      {/* Chat Button */}
      <Fade in={!chatOpen} timeout={{ enter: 300, exit: 0 }} unmountOnExit>
        <Button
          className="shine"
          sx={{
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            background: `linear-gradient(135deg,
              ${theme.palette.primary.dark} 0%,
              ${theme.palette.secondary.dark} 100%)`,
            color: "white",
            padding: "12px 20px",
            textTransform: "none",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            position: "absolute",
            minWidth: "max-content",
            bottom: 0,
            right: 0,
          }}
          onClick={() => setChatOpen(true)}
        >
          <img
            src="/logo.svg"
            alt="Bot Avatar"
            style={{
              width: 24,
              height: 24,
              borderRadius: "20%",
              flexShrink: 0,
              filter: "brightness(0) invert(1)",
            }}
            draggable="false"
          />
        </Button>
      </Fade>
    </div>
  );
};
{
  /* To get how the file looks on messages and when user selects a file, 2 in 1 */
}
const FileView: React.FC<FileViewProps & { theme: Theme }> = ({
  file,
  inMessage = false,
  onRemove,
  theme,
}) => {
  const getFileIcon = (fileType: string, color = "inherit") => {
    switch (fileType) {
      case "application/pdf":
        return <PictureAsPdf sx={{ color }} />;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <Description sx={{ color }} />;
      default:
        return <InsertDriveFile sx={{ color }} />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card
      elevation={inMessage ? 0 : 1}
      onClick={() => window.open(file.url, "_blank")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: inMessage ? 0 : 1,
        cursor: "pointer",
        p: inMessage ? 0 : 1,
        backgroundColor: inMessage ? "transparent" : theme.palette.grey[50],
        border: inMessage ? "none" : `1px solid ${theme.palette.grey[200]}`,
        borderRadius: 2,
        width: inMessage ? "100%" : "95%",
        "&:hover": {
          backgroundColor: inMessage ? "transparent" : theme.palette.grey[100],
        },
      }}
    >
      <Box sx={{ pr: 1 }}>
        {getFileIcon(
          file.type,
          inMessage ? "white" : theme.palette.primary.dark
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: inMessage ? "white" : "black",
          }}
        >
          {file.name}
        </Typography>
        <Typography
          variant="caption"
          color={inMessage ? "white" : "text.secondary"}
        >
          {formatFileSize(file.size)}
        </Typography>
      </Box>
      {onRemove && (
        <IconButton size="small" onClick={(e) => onRemove(e)} sx={{ p: 0.5 }}>
          <DeleteOutline fontSize="small" color="error" />
        </IconButton>
      )}
    </Card>
  );
};
{
  /* Slugsy Header */
}
const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, theme }) => (
  <div
    style={{
      padding: "16px",
      background: `linear-gradient(135deg,
        ${theme.palette.primary.dark} 0%,
        ${theme.palette.secondary.dark} 100%)`,
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src="/logo.svg"
        alt="Bot Avatar"
        style={{
          width: 32,
          height: 32,
          borderRadius: "20%",
          flexShrink: 0,
          filter: "brightness(0) invert(1)",
        }}
        draggable="false"
      />
      <Typography fontWeight="bold">Slugsy</Typography>
    </div>
    <IconButton onClick={onClose} sx={{ color: "white", borderRadius: "8px" }}>
      <Close fontSize="small" />
    </IconButton>
  </div>
);

{
  /* To render the list of messages between user and bot */
}

const MessageList: React.FC<MessageListProps> = ({ messages, theme }) => (
  <Box
    sx={{
      flex: 1,
      padding: "16px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      backgroundColor: theme.palette.grey[50],
      "&::-webkit-scrollbar": {
        width: "8px",
        borderRadius: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: theme.palette.grey[200],
        borderRadius: "8px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: theme.palette.grey[400],
        borderRadius: "8px",
        "&:hover": {
          background: theme.palette.grey[500],
        },
      },
    }}
  >
    {messages.map((message) => (
      <div
        key={message.id}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          alignSelf: message.isBot ? "flex-start" : "flex-end",
          maxWidth: "85%",
        }}
      >
        {message.isBot && (
          <img
            src="/slugsy.png"
            alt="Bot Avatar"
            style={{
              width: 40,
              height: 40,
              border: `1px solid ${theme.palette.divider}`,
              background: COLORS.GRAY_50,
              borderRadius: "50%",
              flexShrink: 0,
            }}
            draggable="false"
          />
        )}
        <div
          style={{
            padding: "12px",
            borderRadius: "16px",
            background: message.isBot
              ? "white"
              : `linear-gradient(135deg,
                  ${theme.palette.primary.main} 0%,
                  ${theme.palette.secondary.main} 100%)`,
            color: message.isBot ? "inherit" : "white",
            boxShadow: theme.shadows[1],
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {message.file && (
              <FileView file={message.file} inMessage={true} theme={theme} />
            )}
            {message.text && (
              <Typography fontSize="0.9rem">{message.text}</Typography>
            )}
          </div>
        </div>
      </div>
    ))}
  </Box>
);
{
  /* Input for the chat, user can put file and also type out preferences */
}
const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  selectedFile,
  onMessageChange,
  onSendMessage,
  onFileClick,
  onRemoveFile,
  theme,
}) => (
  <div
    style={{
      padding: "16px",
      borderTop: `1px solid ${theme.palette.divider}`,
      backgroundColor: "white",
    }}
  >
    {selectedFile && (
      <Box sx={{ mb: 2 }}>
        <FileView file={selectedFile} onRemove={onRemoveFile} theme={theme} />
      </Box>
    )}
    <div style={{ display: "flex", gap: "8px" }}>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Preferences (optional)"
        value={inputMessage}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
        InputProps={{
          startAdornment: (
            <Tooltip
              title="Accepts .pdf, .doc, .docx"
              placement="top"
              PopperProps={{ sx: { zIndex: 3000 } }}
            >
              <IconButton
                onClick={onFileClick}
                sx={{
                  p: 0.5,
                  mr: 1,
                  color: theme.palette.primary.main,
                  "&:hover": { background: "none" },
                }}
              >
                <AttachFile fontSize="small" />
              </IconButton>
            </Tooltip>
          ),
          endAdornment: (
            <IconButton
              onClick={onSendMessage}
              disabled={!selectedFile}
              sx={{
                p: 0.5,
                color: theme.palette.primary.main,
                transition: "0.2s transform ease-in-out",
                "&:hover": {
                  background: "none",
                  transform: "scale(1.1)",
                },
              }}
            >
              <Send fontSize="small" />
            </IconButton>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />
    </div>
  </div>
);
