import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { Loader } from "lucide-react";
import { useState } from "react";

import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { MessageData } from "@/lib/types";
import { ChannelHero } from "./ChannelHero";
import { ConversationHero } from "./ConversationHero";
import { Message } from "./Message";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

interface MessageListProps {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: "channel" | "thread" | "conversation";
  data?: MessageData[];
  canLoadMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
}

const TIME_THRESHOLD = 5;

const formatDateLabel = (dateStr: string) => {
  const date = dayjs(dateStr, "YYYY-MM-DD");
  if (date.isToday()) return "Today";
  if (date.isYesterday()) return "Yesterday";
  return ""; // TODO
};

export const MessageList = ({
  canLoadMore,
  isLoadingMore,
  channelCreationTime,
  channelName,
  data,
  memberImage,
  memberName,
  variant = "channel",
  loadMore,
}: MessageListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const workspaceId = useWorkspaceId();

  const currentMember = useCurrentMember({
    workspaceId,
  });

  const groupedMessages = data?.reduce(
    (groups, message) => {
      const date = new Date(message.createdAt);
      const dateKey = dayjs(date).format("YYYY-MM-DD");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof data>
  );
  return (
    <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
      {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
        <div key={dateKey}>
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              {formatDateLabel(dateKey)}
            </span>
          </div>
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const isCompact =
              prevMessage &&
              prevMessage.user?.id === message.user?.id &&
              dayjs(message.createdAt).diff(
                dayjs(prevMessage.createdAt),
                "minute"
              ) < TIME_THRESHOLD;
            return (
              <Message
                key={message.id}
                id={message.id}
                memberId={message.memberId}
                authorImage={message.user.image ?? undefined}
                authorName={message.user.name ?? undefined}
                reactions={message.reactions}
                body={message.body}
                image={message.image}
                updatedAt={message.updatedAt}
                createdAt={new Date(message.createdAt).getTime()}
                threadCount={message.threadCount}
                threadImage={message.threadImage}
                threadTimestamp={message.threadTimestamp}
                threadName={message.threadName}
                isEditing={editingId === message.id}
                setEditingId={setEditingId}
                isCompact={isCompact}
                hideThreadButton={variant === "thread"}
                isAuthor={currentMember.data?.id === message.memberId}
              />
            );
          })}
        </div>
      ))}
      <div
        className="h-1"
        ref={(el) => {
          if (el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting && canLoadMore) {
                  loadMore();
                }
              },
              {
                threshold: 1.0,
              }
            );
            observer.observe(el);
            return () => observer.disconnect();
          }
        }}
      ></div>
      {isLoadingMore && (
        <div className="text-center my-2 relative">
          <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
          <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
            <Loader className="size-4 animate-spin" />
          </span>
        </div>
      )}
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero name={channelName} creationTime={channelCreationTime} />
      )}
      {variant === "conversation" && memberName && (
        <ConversationHero name={memberName} image={memberImage} />
      )}
    </div>
  );
};
