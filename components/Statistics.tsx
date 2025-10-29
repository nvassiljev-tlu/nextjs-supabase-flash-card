"use client";
import { useState, useEffect } from "react";
import { Stack, Title, Card, Text, Table } from "@mantine/core";
import { getStatistics } from "@/lib/database";
import { Statistics as StatisticsType } from "@/types/database";

interface Summary {
  total: number;
  correct: number;
  wrong: number;
}

export default function Statistics() {
  const [stats, setStats] = useState<StatisticsType[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    correct: 0,
    wrong: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  async function loadStatistics() {
    const { data } = await getStatistics();
    if (data) {
      setStats(data);

      const totalCorrect = data.reduce(
        (sum, stat) => sum + stat.correct_count,
        0
      );
      const totalWrong = data.reduce((sum, stat) => sum + stat.wrong_count, 0);

      setSummary({
        total: totalCorrect + totalWrong,
        correct: totalCorrect,
        wrong: totalWrong,
      });
    }
  }

  const successRate =
    summary.total > 0
      ? ((summary.correct / summary.total) * 100).toFixed(1)
      : 0;

  return (
    <Stack>
      <Title order={2}>Statistika</Title>

      <Card shadow="sm" padding="lg">
        <Stack gap="xs">
          <Text size="xl" fw={700}>
            Üldine statistika
          </Text>
          <Text>Kokku katseid: {summary.total}</Text>
          <Text c="green">Õigeid vastuseid: {summary.correct}</Text>
          <Text c="red">Valesti vastuseid: {summary.wrong}</Text>
          <Text size="lg" fw={600}>
            Õnnestumise määr: {successRate}%
          </Text>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg">
        <Title order={3} mb="md">
          Kaartide statistika
        </Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Küsimus</Table.Th>
              <Table.Th>Kategooria</Table.Th>
              <Table.Th>Õiged</Table.Th>
              <Table.Th>Valed</Table.Th>
              <Table.Th>Viimane katse</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stats.map((stat) => (
              <Table.Tr key={stat.id}>
                <Table.Td>{stat.cards?.question}</Table.Td>
                <Table.Td>{stat.cards?.categories?.name}</Table.Td>
                <Table.Td>{stat.correct_count}</Table.Td>
                <Table.Td>{stat.wrong_count}</Table.Td>
                <Table.Td>
                  {stat.last_attempt
                    ? new Date(stat.last_attempt).toLocaleDateString("et-EE")
                    : "Pole veel"}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
