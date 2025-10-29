"use client";
import { useState, useEffect } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Card,
  Group,
  Stack,
  Title,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  createCard,
  getCardsByCategory,
  updateCard,
  deleteCard,
} from "@/lib/database";
import { Category, Card as CardType } from "@/types/database";

interface CardManagerProps {
  category: Category;
}

interface FormValues {
  question: string;
  answer: string;
}

export default function CardManager({ category }: CardManagerProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      question: "",
      answer: "",
    },
    validate: {
      question: (value) => (!value ? "Küsimus on kohustuslik" : null),
      answer: (value) => (!value ? "Vastus on kohustuslik" : null),
    },
  });

  useEffect(() => {
    if (category) {
      loadCards();
    }
  }, [category]);

  async function loadCards() {
    const { data, error } = await getCardsByCategory(category.id);
    if (error) {
      notifications.show({
        title: "Viga",
        message: "Kaartide laadimine ebaõnnestus",
        color: "red",
      });
    } else {
      setCards(data || []);
    }
  }

  async function handleSubmit(values: FormValues) {
    if (editingCard) {
      const { error } = await updateCard(
        editingCard.id,
        values.question,
        values.answer
      );
      if (error) {
        notifications.show({
          title: "Viga",
          message: "Kaardi uuendamine ebaõnnestus",
          color: "red",
        });
      } else {
        notifications.show({
          title: "Õnnestus",
          message: "Kaart uuendatud!",
          color: "green",
        });
      }
    } else {
      const { error } = await createCard(
        category.id,
        values.question,
        values.answer
      );
      if (error) {
        notifications.show({
          title: "Viga",
          message: "Kaardi loomine ebaõnnestus",
          color: "red",
        });
      } else {
        notifications.show({
          title: "Õnnestus",
          message: "Kaart loodud!",
          color: "green",
        });
      }
    }

    form.reset();
    setModalOpened(false);
    setEditingCard(null);
    loadCards();
  }

  async function handleDelete(cardId: string) {
    const { error } = await deleteCard(cardId);
    if (error) {
      notifications.show({
        title: "Viga",
        message: "Kaardi kustutamine ebaõnnestus",
        color: "red",
      });
    } else {
      notifications.show({
        title: "Õnnestus",
        message: "Kaart kustutatud!",
        color: "green",
      });
      loadCards();
    }
  }

  function openEditModal(card: CardType) {
    setEditingCard(card);
    form.setValues({
      question: card.question,
      answer: card.answer,
    });
    setModalOpened(true);
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>{category.name} - Kaardid</Title>
        <Button
          onClick={() => {
            setEditingCard(null);
            form.reset();
            setModalOpened(true);
          }}
        >
          Lisa uus kaart
        </Button>
      </Group>

      <Stack gap="md">
        {cards.map((card) => (
          <Card key={card.id} shadow="sm" padding="lg">
            <Stack gap="xs">
              <Title order={4}>K: {card.question}</Title>
              <p>V: {card.answer}</p>
              <Group>
                <Button size="xs" onClick={() => openEditModal(card)}>
                  Muuda
                </Button>
                <Button
                  size="xs"
                  color="red"
                  onClick={() => handleDelete(card.id)}
                >
                  Kustuta
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingCard(null);
          form.reset();
        }}
        title={editingCard ? "Muuda kaarti" : "Lisa uus kaart"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Küsimus"
              placeholder="Sisesta küsimus"
              {...form.getInputProps("question")}
            />
            <Textarea
              label="Vastus"
              placeholder="Sisesta vastus"
              {...form.getInputProps("answer")}
            />
            <Button type="submit">{editingCard ? "Uuenda" : "Loo"}</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
