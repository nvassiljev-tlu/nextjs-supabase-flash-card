"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Stack,
  Title,
  Group,
  TextInput,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getCardsByCategory, updateStatistics } from "@/lib/database";
import { Category, Card as CardType } from "@/types/database";

interface PlayModeProps {
  category: Category;
  onBack: () => void;
}

interface Score {
  correct: number;
  wrong: number;
}

export default function PlayMode({ category, onBack }: PlayModeProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRandom, setIsRandom] = useState(false);
  const [score, setScore] = useState<Score>({ correct: 0, wrong: 0 });

  useEffect(() => {
    loadCards();
  }, [category, isRandom]);

  async function loadCards() {
    const { data, error } = await getCardsByCategory(category.id);
    if (error) {
      notifications.show({
        title: "Viga",
        message: "Kaartide laadimine ebaõnnestus",
        color: "red",
      });
    } else {
      const loadedCards = data || [];
      if (isRandom) {
        setCards([...loadedCards].sort(() => Math.random() - 0.5));
      } else {
        setCards(loadedCards);
      }
    }
  }

  function handleCheckAnswer() {
    const currentCard = cards[currentIndex];
    const isCorrect =
      userAnswer.trim().toLowerCase() ===
      currentCard.answer.trim().toLowerCase();

    updateStatistics(currentCard.id, isCorrect);

    if (isCorrect) {
      setScore({ ...score, correct: score.correct + 1 });
      notifications.show({
        title: "Õige!",
        message: "Suurepärane vastus!",
        color: "green",
      });
    } else {
      setScore({ ...score, wrong: score.wrong + 1 });
      notifications.show({
        title: "Vale",
        message: `Õige vastus: ${currentCard.answer}`,
        color: "red",
      });
    }

    setShowAnswer(true);
  }

  function handleNext() {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setUserAnswer("");
    } else {
      notifications.show({
        title: "Lõpp!",
        message: `Õiged: ${score.correct}, Valed: ${score.wrong}`,
        color: "blue",
      });
      onBack();
    }
  }

  if (cards.length === 0) {
    return (
      <Stack>
        <Title order={2}>Kaarte pole saadaval</Title>
        <Button onClick={onBack}>Tagasi</Button>
      </Stack>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Mängurežiim - {category.name}</Title>
        <Group>
          <Button
            variant={isRandom ? "filled" : "outline"}
            onClick={() => {
              setIsRandom(!isRandom);
              setCurrentIndex(0);
              setShowAnswer(false);
              setUserAnswer("");
            }}
          >
            {isRandom ? "Juhuslik" : "Järjestatud"}
          </Button>
          <Button onClick={onBack}>Tagasi</Button>
        </Group>
      </Group>

      <Text size="sm">
        Kaart {currentIndex + 1} / {cards.length} | Õiged: {score.correct} |
        Valed: {score.wrong}
      </Text>

      <Card shadow="md" padding="xl">
        <Stack gap="lg">
          <Title order={3}>{currentCard.question}</Title>

          {!showAnswer ? (
            <>
              <TextInput
                placeholder="Sisesta vastus"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleCheckAnswer();
                }}
              />
              <Button onClick={handleCheckAnswer} disabled={!userAnswer.trim()}>
                Kontrolli
              </Button>
            </>
          ) : (
            <>
              <Text size="lg" fw={700}>
                Õige vastus: {currentCard.answer}
              </Text>
              <Text size="md">Sinu vastus: {userAnswer}</Text>
              <Button onClick={handleNext}>
                {currentIndex < cards.length - 1 ? "Järgmine" : "Lõpeta"}
              </Button>
            </>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
