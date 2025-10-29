"use client";
import { useState } from "react";
import { Container, Tabs, Button } from "@mantine/core";
import CategoryManager from "@/components/CategoryManager";
import CardManager from "@/components/CardManager";
import PlayMode from "@/components/PlayMode";
import Statistics from "@/components/Statistics";
import { Category } from "@/types/database";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string | null>("manage");
  const [playCategory, setPlayCategory] = useState<Category | null>(null);

  return (
    <Container size="lg" py="xl">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="manage">Haldamine</Tabs.Tab>
          <Tabs.Tab value="play">Mäng</Tabs.Tab>
          <Tabs.Tab value="stats">Statistika</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="manage" pt="xl">
          {!selectedCategory ? (
            <CategoryManager onSelectCategory={setSelectedCategory} />
          ) : (
            <>
              <CardManager category={selectedCategory} />
              <Button mt="md" onClick={() => setSelectedCategory(null)}>
                Tagasi kategooriatele
              </Button>
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="play" pt="xl">
          {!playCategory ? (
            <CategoryManager onSelectCategory={(cat) => setPlayCategory(cat)} />
          ) : (
            <PlayMode
              category={playCategory}
              onBack={() => setPlayCategory(null)}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="stats" pt="xl">
          <Statistics />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
