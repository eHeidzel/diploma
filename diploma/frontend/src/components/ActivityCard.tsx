
import React from "react";
import {
  Card,
  Button,
  Avatar,
  Typography,
  Space,
  Tag,
  Badge,
  Divider,
  Tooltip,
} from "antd";
import {
  BookOutlined,
  VideoCameraOutlined,
  TrophyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  TeamOutlined,
  GiftOutlined,
  StarOutlined,
  EyeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import styles from "@styles/learning.module.css";

const { Title, Text, Paragraph } = Typography;

type ActivityType =
  | "webinar"
  | "masterclass"
  | "individual"
  | "group"
  | "trial";

const CATEGORIES = [
  { value: "frontend", label: "Frontend", color: "#52c41a", icon: "🎨" },
  { value: "backend", label: "Backend", color: "#1890ff", icon: "⚙️" },
  { value: "fullstack", label: "Fullstack", color: "#722ed1", icon: "🌐" },
  { value: "mobile", label: "Mobile", color: "#13c2c2", icon: "📱" },
  { value: "devops", label: "DevOps", color: "#fa8c16", icon: "🚀" },
  {
    value: "data_science",
    label: "Data Science",
    color: "#eb2f96",
    icon: "📊",
  },
  { value: "qa", label: "QA", color: "#2f54eb", icon: "🐛" },
  { value: "pm", label: "Project Manager", color: "#faad14", icon: "📋" },
  { value: "ux_ui", label: "UX/UI Design", color: "#f5222d", icon: "🎯" },
  { value: "security", label: "Security", color: "#a0a0a0", icon: "🔒" },
];

interface ActivityCardProps {
  activity: any;
  isTeacher: boolean;
  onBookingClick: (activity: any) => void;
  onViewReviews?: (activity: any) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isTeacher,
  onBookingClick,
  onViewReviews,
}) => {
  const isFree =
    activity.price === 0 ||
    activity.price === null ||
    activity.price === undefined;
  const displayPrice =
    typeof activity.price === "string"
      ? parseFloat(activity.price)
      : activity.price;

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "webinar":
        return <VideoCameraOutlined />;
      case "masterclass":
        return <TrophyOutlined />;
      case "individual":
        return <UserOutlined />;
      case "group":
        return <TeamOutlined />;
      case "trial":
        return <GiftOutlined />;
      default:
        return <BookOutlined />;
    }
  };

  const getActivityTypeName = (type: ActivityType) => {
    switch (type) {
      case "webinar":
        return "Вебинар";
      case "masterclass":
        return "Мастер-класс";
      case "individual":
        return "Индивидуальное";
      case "group":
        return "Групповое";
      case "trial":
        return "Пробное";
      default:
        return "";
    }
  };

  const actions = [
    <Button
      key="book"
      type={isTeacher ? "default" : "primary"}
      onClick={() => onBookingClick(activity)}
      className={`${styles.bookButton} ${isTeacher ? styles.viewButton : ""}`}
      size="small"
      icon={isTeacher ? <EyeOutlined /> : undefined}
    >
      {isTeacher
        ? "Подробнее"
        : isFree
          ? "Бесплатно"
          : `За ${displayPrice} BYN`}
    </Button>,
  ];

  if (onViewReviews) {
    actions.push(
      <Tooltip key="reviews" title="Отзывы">
        <Button
          type="text"
          size="small"
          icon={<MessageOutlined />}
          onClick={() => onViewReviews(activity)}
          className={styles.reviewsButton}
        >
          {activity.reviewsCount || 0}
        </Button>
      </Tooltip>,
    );
  }

  return (
    <Card
      className={styles.activityCard}
      hoverable
      size="small"
      actions={actions}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>{getActivityIcon(activity.type)}</div>
        <Badge
          count={getActivityTypeName(activity.type)}
          className={`${styles.typeBadge} ${activity.type === "trial" ? styles.trialBadge : ""}`}
        />
      </div>
      <Title level={5} className={styles.cardTitle}>
        {activity.title}
      </Title>
      <div className={styles.teacherInfo}>
        <Avatar
          size="small"
          src={activity.teacherAvatar}
          icon={<UserOutlined />}
        />
        <Text className={styles.teacherName}>{activity.teacher}</Text>
      </div>
      <Paragraph ellipsis={{ rows: 2 }} className={styles.cardDescription}>
        {activity.description}
      </Paragraph>

      {(activity.type === "individual" || activity.type === "group") &&
        activity.hourType && (
          <div className={styles.hourTypeBadge}>
            <Tag
              color={activity.hourType === "academic" ? "blue" : "gold"}
              className={styles.hourTypeTag}
            >
              {activity.hourType === "academic"
                ? "🎓 Академический час"
                : "⭐ Астрономический час"}
            </Tag>
          </div>
        )}

      {/* ВОЗВРАЩЕН СТИЛЬ НАПРАВЛЕНИЙ КАК БЫЛ - С ТЕГАМИ */}
      <div className={styles.categoriesRow}>
        {activity.categories.map((cat: string) => {
          const category = CATEGORIES.find((c) => c.value === cat);
          return category ? (
            <Tag
              key={cat}
              color={category.color}
              className={styles.categoryTag}
            >
              {category.icon} {category.label}
            </Tag>
          ) : null;
        })}
      </div>

      <div className={styles.statsRow}>
        <Space size="small">
          {activity.rating > 0 && (
            <span className={styles.rating}>
              <StarOutlined /> {activity.rating}
            </span>
          )}
          {activity.enrolledCount > 0 && (
            <span className={styles.enrolled}>
              <UserOutlined /> {activity.enrolledCount}
            </span>
          )}
        </Space>
      </div>

      {/* УБРАН БЛОК targetAudience - возраст и уровень */}
      {/* <div className={styles.targetAudience}>
        <div className={styles.audienceBadge}>
          <UserOutlined /> {activity.targetAudience?.ageRange || "Не указано"} лет
        </div>
        <div className={styles.audienceBadge}>
          <ExperimentOutlined /> {activity.targetAudience?.level || "Любой"}
        </div>
      </div> */}

      <div className={styles.cardDetails}>
        <Space split={<Divider type="vertical" />}>
          <span>
            <ClockCircleOutlined /> {activity.duration}
          </span>
        </Space>
      </div>

      {activity.type === "group" && activity.learningPlan && (
        <div className={styles.planPreview}>
          <Text type="secondary">
            📚 {activity.learningPlan.length} модулей
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ActivityCard;
