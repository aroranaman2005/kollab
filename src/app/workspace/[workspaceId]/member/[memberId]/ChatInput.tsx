import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useCreateMessage } from "@/features/messages/api/useCreateMessage";
import { useUploadFile } from "@/features/upload/api/useGenerateUploadUrl";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
  conversationId: string;
}

type CreateMessageValues = {
  conversationId: string;
  workspaceId: string;
  body: string;
  image?: string;
};

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
  const editorRef = useRef<Quill | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const workspaceId = useWorkspaceId();
  const createMessage = useCreateMessage();
  const { uploadFile } = useUploadFile();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef.current?.enable(false);

      const values: CreateMessageValues = {
        body,
        workspaceId,
        conversationId,
        image: undefined,
      };

      if (image) {
        const imageUrl = await uploadFile(image);
        values.image = imageUrl;
      }

      await createMessage.mutateAsync(values);
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};