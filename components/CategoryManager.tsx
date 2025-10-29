"use client";
import { useState, useEffect } from "react";
import { TextInput, Button, Card, Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createCategory, getCategories } from "@/lib/database";
import { Category } from "@/types/database";

interface CategoryManagerProps {
  onSelectCategory: (category: Category) => void;
}

export default function CategoryManager({
  onSelectCategory,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data, error } = await getCategories();
    if (error) {
      notifications.show({
        title: "Viga",
        message: "Kategooriate laadimine ebaõnnestus",
        color: "red",
      });
    } else {
      setCategories(data || []);
    }
  }

  async function handleCreateCategory() {
    if (!newCategory.trim()) return;

    const { error } = await createCategory(newCategory);
    if (error) {
      notifications.show({
        title: "Viga",
        message: "Kategooria loomine ebaõnnestus",
        color: "red",
      });
    } else {
      notifications.show({
        title: "Õnnestus",
        message: "Kategooria loodud!",
        color: "green",
      });
      setNewCategory("");
      loadCategories();
    }
  }

  return (
    <Stack>
      <Title order={2}>Kategooriad</Title>
      <Group>
        <TextInput
          placeholder="Uus kategooria nimi"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button onClick={handleCreateCategory}>Lisa kategooria</Button>
      </Group>
      <Stack gap="md">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            shadow="sm"
            padding="lg"
            onClick={() => onSelectCategory(cat)}
            style={{ cursor: "pointer" }}
          >
            <Title order={4}>{cat.name}</Title>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
