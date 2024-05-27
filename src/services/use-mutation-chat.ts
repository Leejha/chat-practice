import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  GetChatResponse,
  postChatAPI,
  reactQueryKeys,
  saveChatAPI,
} from "../lib";
import { formatDateTime } from "../lib/utils/format-date-time";

export const TOPIC_LIST = [
  { value: "career", label: "학업진로" },
  { value: "relationship", label: "대인관계" },
  { value: "addiction", label: "인터넷-스마트폰 중독" },
  { value: "family", label: "가족" },
] as const;

export interface Topic {
  value: string;
  label: string;
}

export default function useMutationChat() {
  const queryClient = useQueryClient();

  const [selectedTopic, setTopic] = useState<Topic>({
    value: "",
    label: "",
  });
  const onChangeTopic = (value: Topic) => {
    setTopic(value);
  };

  const [question, setQuestion] = useState("");
  const onChangeQuestion = (value: string) => {
    setQuestion(value);
  };
  const onResetQuestion = () => {
    setQuestion("");
  };

  const [currentChatList, setCurrentChatList] = useState<GetChatResponse[]>([]);
  const onResetCurrentChatList = () => {
    setCurrentChatList([]);
  };

  const currentDateTime = new Date().toISOString();
  const formattedTime = formatDateTime(currentDateTime);

  const {
    data: postChatResponse,
    mutate: postChat,
    isPending,
  } = useMutation({
    mutationFn: () => postChatAPI({ question }),
    onSuccess: ({ question, answer }) => {
      saveChatAPI({ question, answer });
      selectedTopic.label &&
        setCurrentChatList((prev) => [
          ...prev,
          {
            question: selectedTopic.label,
            answer: "",
            createdAt: formattedTime,
          },
        ]);
      setCurrentChatList((prev) => [
        ...prev,
        {
          question,
          answer,
          createdAt: formattedTime,
        },
      ]);
      setTopic({ value: "", label: "" });
      onResetQuestion();
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.getChatLogs({}),
      });
    },
  });

  return {
    selectedTopic,
    onChangeTopic,
    question,
    onChangeQuestion,
    onResetQuestion,
    postChatResponse,
    postChat,
    currentChatList,
    setCurrentChatList,
    onResetCurrentChatList,
    isPending,
  };
}
