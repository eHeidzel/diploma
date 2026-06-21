import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Radio,
  Button,
  Progress,
  Space,
  Typography,
  message,
  Checkbox,
  Row,
  Col,
  Tag,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";
import styles from "../css/test.module.css";
import api from "../services/api";

const { Title, Text } = Typography;
const { Group: RadioGroup } = Radio;

interface QuestionOption {
  id: number;
  text: string;
  directionScores: Record<string, number>;
}

interface Question {
  id: number;
  text: string;
  type: "single" | "multiple" | "text";
  options?: QuestionOption[];
  explanation?: string;
}

interface DirectionResult {
  direction: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  skills: string[];
  salary: string;
  totalScore: number;
}

interface TestResult {
  results: DirectionResult[];
  topDirection: DirectionResult;
  recommendations: string[];
}

const Test: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { t, i18n } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, [i18n.language]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/questions`, {
        params: { lang: i18n.language },
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      message.error(
        t("test.errors.loadQuestions") || "Ошибка загрузки вопросов",
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestion = () => questions[currentQuestion];
  const currentQ = getCurrentQuestion();

  const getCurrentAnswer = (): number[] => {
    return answers.get(currentQ?.id) || [];
  };

  const handleSingleAnswer = (optionId: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQ.id, [optionId]);
    setAnswers(newAnswers);
  };

  const handleMultipleAnswer = (optionId: number, checked: boolean) => {
    const newAnswers = new Map(answers);
    const current = newAnswers.get(currentQ.id) || [];

    if (checked) {
      current.push(optionId);
    } else {
      const index = current.indexOf(optionId);
      if (index > -1) current.splice(index, 1);
    }

    newAnswers.set(currentQ.id, current);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    const answer = getCurrentAnswer();
    if (answer.length === 0) {
      message.warning(
        t("test.errors.answerRequired") || "Пожалуйста, ответьте на вопрос",
      );
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      window.scrollTo(0, 0);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleFinish = async () => {
    const unanswered = questions.filter((q) => {
      const answer = answers.get(q.id);
      return !answer || answer.length === 0;
    });

    if (unanswered.length > 0) {
      message.warning(`Вы не ответили на ${unanswered.length} вопрос(ов)`);
      return;
    }

    setSubmitting(true);
    try {
      const submitAnswers = Array.from(answers.entries()).map(
        ([questionId, optionIds]) => ({
          questionId,
          selectedOptionId: optionIds[0],
        }),
      );

      const response = await api.post(`/questions/calculate`, {
        answers: submitAnswers,
        lang: i18n.language,
      });

      setResult(response.data);
      message.success("Результаты готовы!");
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error("Error calculating results:", error);
      message.error(
        error.response?.data?.message || "Ошибка при обработке результатов",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers(new Map());
    setResult(null);
    setSubmitting(false);
    window.scrollTo(0, 0);
  };

  const handleCategoryClick = (directionCode: string) => {
    navigate(`/dashboard/learning?category=${directionCode}`);
  };

  const renderQuestion = () => {
    if (!currentQ) return null;

    switch (currentQ.type) {
      case "single":
        return (
          <RadioGroup
            value={getCurrentAnswer()[0]}
            onChange={(e) => handleSingleAnswer(e.target.value)}
            className={styles.optionsGroup}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {currentQ.options?.map((option) => (
                <Radio
                  key={option.id}
                  value={option.id}
                  className={styles.option}
                >
                  {option.text}
                </Radio>
              ))}
            </Space>
          </RadioGroup>
        );

      case "multiple":
        return (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {currentQ.options?.map((option) => (
              <Checkbox
                key={option.id}
                checked={getCurrentAnswer().includes(option.id)}
                onChange={(e) =>
                  handleMultipleAnswer(option.id, e.target.checked)
                }
                className={styles.option}
              >
                {option.text}
              </Checkbox>
            ))}
          </Space>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className={styles.resultsContainer}>
        <div className={styles.topDirectionCard}>
          <div className={styles.topDirectionIcon}>
            {result.topDirection.icon}
          </div>
          <Title level={2} className={styles.topDirectionName}>
            {result.topDirection.name}
          </Title>
          <Text className={styles.topDirectionDescription}>
            {result.topDirection.description}
          </Text>
          <Tag color={result.topDirection.color} className={styles.salaryTag}>
            Заработок {result.topDirection.salary}
          </Tag>
          <Button
            type="primary"
            size="large"
            onClick={() => handleCategoryClick(result.topDirection.direction)}
            style={{ marginTop: 16 }}
          >
            Перейти к обучению по направлению {result.topDirection.name}
          </Button>
        </div>

        <Divider orientation="center" className={styles.sectionDivider}>
          Все возможные направления
        </Divider>

        <Row gutter={[16, 16]} className={styles.directionsGrid}>
          {result.results.map((direction) => (
            <Col xs={24} sm={12} md={8} lg={6} key={direction.direction}>
              <Card
                className={styles.directionCard}
                style={{ borderTop: `4px solid ${direction.color}` }}
                hoverable
                bodyStyle={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                onClick={() => handleCategoryClick(direction.direction)}
              >
                <div className={styles.directionHeader}>
                  <span className={styles.directionIcon}>{direction.icon}</span>
                  <Title level={5} className={styles.directionName}>
                    {direction.name}
                  </Title>
                </div>
                <Text type="secondary" className={styles.directionDescription}>
                  {direction.description}
                </Text>
                <div className={styles.directionSkills}>
                  {direction.skills.slice(0, 3).map((skill, idx) => (
                    <Tag key={idx} color="blue" className={styles.skillTag}>
                      {skill}
                    </Tag>
                  ))}
                </div>
                <Button
                  type="primary"
                  size="small"
                  className={styles.chooseDirectionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(direction.direction);
                  }}
                >
                  Выбрать направление
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider orientation="center" className={styles.sectionDivider}>
          Рекомендации для старта
        </Divider>

        <Card className={styles.recommendationsCard}>
          <ul className={styles.recommendationsList}>
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>
                <CheckCircleFilled
                  style={{ color: "#52c41a", marginRight: 12 }}
                />
                {rec}
              </li>
            ))}
          </ul>
        </Card>

        <Button
          type="primary"
          onClick={handleRestart}
          className={styles.restartButton}
        >
          Пройти тест заново
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Card className={styles.testCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <Text>Загрузка вопросов...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (result) {
    return <div className={styles.container}>{renderResults()}</div>;
  }

  if (!questions.length) return null;

  const progress = Math.round((currentQuestion / questions.length) * 100);

  return (
    <div className={styles.container}>
      <Card className={styles.testCard} bodyStyle={{ padding: 0 }}>
        <div className={styles.header}>
          <Title level={getTitleLevel(2)}>Кто вы в IT?</Title>
          <Text type="secondary" className={styles.subtitle}>
            Пройдите тест и узнайте, какое направление в IT вам подходит больше
            всего
          </Text>
          <div className={styles.progressInfo}>
            <ClockCircleOutlined />
            <Text>
              Вопрос {currentQuestion + 1} из {questions.length}
            </Text>
          </div>
          <Progress
            percent={progress}
            status="active"
            className={styles.progress}
          />
        </div>

        <div className={styles.questionContainer}>
          <Title level={getTitleLevel(3)} className={styles.questionText}>
            {currentQ.text}
          </Title>
          {currentQ.type === "multiple" && (
            <Text type="secondary" className={styles.hint}>
              Можно выбрать несколько вариантов ответа
            </Text>
          )}
          {renderQuestion()}
        </div>
      </Card>

      <div className={styles.footer}>
        <Space>
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            icon={<ArrowLeftOutlined />}
            size="large"
          >
            Назад
          </Button>
          <Button
            type="primary"
            onClick={handleNext}
            icon={<ArrowRightOutlined />}
            loading={submitting}
            size="large"
          >
            {currentQuestion < questions.length - 1 ? "Далее" : "Завершить"}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Test;
