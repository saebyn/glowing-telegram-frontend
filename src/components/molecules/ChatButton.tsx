import type { ChatMessage } from '@/types';
import { type FC, useState } from 'react';
import { Button, useDataProvider } from 'react-admin';
import ChatDialog from './ChatDialog';

interface ChatButtonProps {
  onChange: (_content: string) => void;
  job: string;
  transcript: string;
  context: string;
}

const ChatButton: FC<ChatButtonProps> = ({
  job,
  transcript,
  context,
  onChange,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const dataProvider = useDataProvider();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChat = async (
    messages: ChatMessage[],
  ): Promise<ChatMessage[]> => {
    return dataProvider.chat(messages);
  };

  const handleChange = (content: string) => {
    setOpen(false);
    onChange(content);
  };

  return (
    <>
      <ChatDialog
        open={open}
        onClose={handleClose}
        context={context}
        job={job}
        transcript={transcript}
        onChat={handleChat}
        onChange={handleChange}
      />

      <Button label="Chat" color="primary" onClick={handleOpen} />
    </>
  );
};

export default ChatButton;
