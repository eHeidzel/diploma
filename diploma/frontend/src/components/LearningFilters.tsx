import React from "react";
import { Tag, Space, Switch, Button, Dropdown } from "antd";
import {
  GiftOutlined,
  VideoCameraOutlined,
  TrophyOutlined,
  UserOutlined,
  TeamOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import styles from "../css/learning.module.css";

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

type ActivityType =
  | "webinar"
  | "masterclass"
  | "individual"
  | "group"
  | "trial";
type SortField = "popularity" | "rating" | "price";
type SortOrder = "asc" | "desc";

interface LearningFiltersProps {
  activeFilter: ActivityType | "all";
  onActiveFilterChange: (filter: ActivityType | "all") => void;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  showOnlyFree: boolean;
  onFreeSwitchChange: (checked: boolean) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderToggle: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const LearningFilters: React.FC<LearningFiltersProps> = ({
  activeFilter,
  onActiveFilterChange,
  selectedCategories,
  onCategoryToggle,
  showOnlyFree,
  onFreeSwitchChange,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderToggle,
  onClearFilters,
  hasActiveFilters,
}) => {
  const getSortFieldLabel = () => {
    const labels: Record<SortField, string> = {
      popularity: "Популярности",
      rating: "Оценке",
      price: "Цене",
    };
    return labels[sortField];
  };

  const sortMenuItems = [
    {
      key: "popularity",
      label: "По популярности",
      onClick: () => onSortFieldChange("popularity"),
    },
    {
      key: "rating",
      label: "По оценке",
      onClick: () => onSortFieldChange("rating"),
    },
    {
      key: "price",
      label: "По цене",
      onClick: () => onSortFieldChange("price"),
    },
  ];

  return (
    <>
      <div className={styles.filtersRow}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Тип:</span>
          <Space wrap size="small">
            <Tag
              className={`${styles.filterTag} ${activeFilter === "all" ? styles.activeFilter : ""}`}
              onClick={() => onActiveFilterChange("all")}
            >
              Все
            </Tag>
            <Tag
              className={`${styles.filterTag} ${activeFilter === "trial" ? styles.activeFilter : ""}`}
              onClick={() => onActiveFilterChange("trial")}
            >
              <GiftOutlined /> Пробные
            </Tag>
            <Tag
              className={`${styles.filterTag} ${activeFilter === "webinar" ? styles.activeFilter : ""}`}
              onClick={() => onActiveFilterChange("webinar")}
            >
              <VideoCameraOutlined /> Вебинары
            </Tag>
            <Tag
              className={`${styles.filterTag} ${activeFilter === "masterclass" ? styles.activeFilter : ""}`}
              onClick={() => onActiveFilterChange("masterclass")}
            >
              <TrophyOutlined /> Мастер-классы
            </Tag>
            <Tag
              className={`${styles.filterTag} ${activeFilter === "individual" ? styles.activeFilter : ""}`}
              onClick={() => onActiveFilterChange("individual")}
            >
              <UserOutlined /> Индивидуальные
            </Tag>
            <Tag
              className={`${styles.filterTag} ${activeFilter === "group" ? styles.activeFilter : ""}`}
              onClick={() => onActiveFilterChange("group")}
            >
              <TeamOutlined /> Групповые
            </Tag>
          </Space>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>
            Направление (кликните чтобы убрать):
          </span>
          <div className={styles.categoriesTags}>
            {CATEGORIES.map((cat) => (
              <Tag
                key={cat.value}
                color={
                  selectedCategories.includes(cat.value) ? cat.color : undefined
                }
                className={`${styles.categoryFilterTag} ${selectedCategories.includes(cat.value) ? styles.categoryFilterActive : styles.categoryFilterInactive}`}
                onClick={() => onCategoryToggle(cat.value)}
              >
                {cat.icon} {cat.label}
              </Tag>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <Switch
            checked={showOnlyFree}
            onChange={onFreeSwitchChange}
            size="small"
          />
          <span className={styles.freeLabel}>Только бесплатные</span>
        </div>

        {hasActiveFilters && (
          <Button
            type="link"
            onClick={onClearFilters}
            className={styles.clearAllBtn}
          >
            Сбросить все
          </Button>
        )}
      </div>

      <div className={styles.sortSection}>
        <Space size="middle" wrap>
          <div className={styles.sortLabel}>Сортировать по:</div>
          <Dropdown menu={{ items: sortMenuItems }} trigger={["click"]}>
            <Button size="small" className={styles.sortFieldButton}>
              {getSortFieldLabel()}
            </Button>
          </Dropdown>
          <Button
            size="small"
            className={styles.sortOrderButton}
            onClick={onSortOrderToggle}
            icon={
              sortOrder === "desc" ? (
                <SortDescendingOutlined />
              ) : (
                <SortAscendingOutlined />
              )
            }
          />
        </Space>
      </div>
    </>
  );
};

export default LearningFilters;
