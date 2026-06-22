import React, { useEffect, useState } from "react";
import {
  message,
  Row,
  Col,
  Typography,
  Empty,
  Pagination,
  Input,
  Modal,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";
import styles from "../css/learning.module.css";
import { activitiesApi, profileApi } from "../services/api";
import dayjs from "dayjs";
import i18n from "../i18n";
import DefaultBookingModal from "../components/DefaultBookingModal";
import IndividualBookingModal from "../components/IndividualBookingModal";
import GroupBookingModal from "../components/GroupBookingModal";
import ActivityCard from "../components/ActivityCard";
import LearningFilters from "../components/LearningFilters";
import ReviewsModal from "../components/ReviewsModal";
import BalanceModal from "../components/BalanceModal";

const { Title, Text } = Typography;
const { Search } = Input;

type ActivityType =
  | "webinar"
  | "masterclass"
  | "individual"
  | "group"
  | "trial";
type SortField = "popularity" | "rating" | "price";
type SortOrder = "asc" | "desc";

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

const ALL_CATEGORIES = CATEGORIES.map((c) => c.value);

interface LearningProps {
  user?: any;
}

const Learning: React.FC<LearningProps> = ({ user }) => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeFilter, setActiveFilter] = useState<ActivityType | "all">("all");
  const [sortField, setSortField] = useState<SortField>("popularity");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    ...ALL_CATEGORIES,
  ]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [firstLessonInfo, setFirstLessonInfo] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [selectedActivityForReviews, setSelectedActivityForReviews] =
    useState<any>(null);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [hasAppliedInitialFilter, setHasAppliedInitialFilter] = useState(false);

  const isAuthenticated = !!user && user?.role !== "guest" && !user?.isGuest;
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";
  const isGuest = !isAuthenticated;

  const getInitialCategory = () => {
    const params = new URLSearchParams(location.search);
    return params.get("category");
  };

  useEffect(() => {
    if (isAuthenticated && isStudent) {
      fetchBalance();
    }
  }, [isAuthenticated, isStudent]);

  const fetchBalance = async () => {
    try {
      const response = await profileApi.getBalance();
      setUserBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await activitiesApi.getAll(i18n?.language);
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      message.error(t("adminActivities.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [i18n?.language]);

  useEffect(() => {
    if (!hasAppliedInitialFilter && activities.length > 0) {
      const categoryParam = getInitialCategory();
      if (categoryParam && categoryParam !== "") {
        const categoryExists = CATEGORIES.some(
          (c) => c.value === categoryParam,
        );
        if (categoryExists) {
          setSelectedCategories([categoryParam]);
          message.info(
            `${t("learning.filters.categories")}: ${CATEGORIES.find((c) => c.value === categoryParam)?.label}`,
          );
        }
      }
      setHasAppliedInitialFilter(true);
      if (location.search) {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [
    activities,
    hasAppliedInitialFilter,
    location.pathname,
    location.search,
    navigate,
  ]);

  const handleBookingClick = (activity: any) => {
    if (isGuest) {
      Modal.confirm({
        title: t("learning.guestModal.title"),
        content: t("learning.guestModal.content"),
        okText: t("learning.guestModal.register"),
        cancelText: t("learning.guestModal.cancel"),
        centered: true,
        onOk: () => navigate("/register"),
      });
      return;
    }

    if (isTeacher) {
      setSelectedActivity(activity);
      setIsBookingModalOpen(true);
      return;
    }

    if (activity.price && activity.price > 0) {
      if (!isAuthenticated) {
        Modal.confirm({
          title: t("learning.guestModal.title"),
          content: t("learning.guestModal.content"),
          okText: t("learning.guestModal.register"),
          cancelText: t("learning.guestModal.cancel"),
          centered: true,
          onOk: () => navigate("/register"),
        });
      } else if (userBalance < activity.price) {
        Modal.confirm({
          title: t("learning.balanceModal.insufficientFunds"),
          content: t("learning.balanceModal.insufficientFunds")
            .replace("{{balance}}", userBalance.toString())
            .replace("{{price}}", activity.price.toString()),
          okText: t("learning.balanceModal.topUp"),
          cancelText: t("learning.balanceModal.cancel"),
          centered: true,
          onOk: () => setBalanceModalVisible(true),
        });
      } else {
        setSelectedActivity(activity);
        setFirstLessonInfo(null);
        setIsBookingModalOpen(true);
      }
    } else {
      setSelectedActivity(activity);
      setFirstLessonInfo(null);
      setIsBookingModalOpen(true);
    }
  };

  const handleSubmitBooking = async (values: any) => {
    try {
      await activitiesApi.book(selectedActivity?.id, values);
      message.success(
        t("learning.booking.success").replace("{{title}}", selectedActivity?.title || ""),
      );
      handleCloseBookingModal();
      if (isStudent && selectedActivity?.price > 0) {
        fetchBalance();
      }
      await fetchActivities();
    } catch (error: any) {
      console.error("Booking error:", error);
      message.error(error.response?.data?.message || t("learning.booking.error"));
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedActivity(null);
    setFirstLessonInfo(null);
  };

  const handleShowReviews = (activity: any) => {
    setSelectedActivityForReviews(activity);
    setReviewsModalVisible(true);
  };

  const handleReviewChange = async () => {
    await fetchActivities();
  };

  const filteredByType = activities.filter(
    (activity) => activeFilter === "all" || activity.type === activeFilter,
  );

  const filteredByCategories = filteredByType.filter((activity) => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.some((cat) => activity.categories?.includes(cat));
  });

  const filteredBySearch = filteredByCategories.filter(
    (activity) =>
      activity.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.teacher?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredByPrice = filteredBySearch.filter(
    (activity) => !showOnlyFree || activity.price === 0,
  );

  const sortedActivities = [...filteredByPrice].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "price":
        comparison = (a.price || 0) - (b.price || 0);
        break;
      case "popularity":
        comparison = (b.enrolledCount || 0) - (a.enrolledCount || 0);
        break;
      case "rating":
        comparison = (b.rating || 0) - (a.rating || 0);
        break;
    }
    return sortOrder === "desc" ? comparison : -comparison;
  });

  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalItems = filteredByPrice.length;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <Text>{t("learning.loading")}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)}>{t("learning.title")}</Title>
        <Text type="secondary">{t("learning.subtitle")}</Text>
      </div>

      <div className={styles.searchSection}>
        <Search
          placeholder={t("learning.searchPlaceholder")}
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <LearningFilters
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        selectedCategories={selectedCategories}
        onCategoryToggle={(cat) => {
          if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter((c) => c !== cat));
          } else {
            setSelectedCategories([...selectedCategories, cat]);
          }
          if (
            selectedCategories.length === 1 &&
            selectedCategories.includes(cat)
          ) {
            setSelectedCategories([...ALL_CATEGORIES]);
          }
          setCurrentPage(1);
        }}
        showOnlyFree={showOnlyFree}
        onFreeSwitchChange={(checked) => {
          setShowOnlyFree(checked);
          setCurrentPage(1);
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortFieldChange={(field) => {
          setSortField(field);
          setCurrentPage(1);
        }}
        onSortOrderToggle={() => {
          setSortOrder(sortOrder === "desc" ? "asc" : "desc");
        }}
        onClearFilters={() => {
          setActiveFilter("all");
          setSelectedCategories([...ALL_CATEGORIES]);
          setSearchText("");
          setShowOnlyFree(false);
          setCurrentPage(1);
        }}
        hasActiveFilters={
          selectedCategories.length !== ALL_CATEGORIES.length ||
          showOnlyFree ||
          activeFilter !== "all" ||
          searchText !== ""
        }
      />

      {paginatedActivities.length > 0 ? (
        <>
          <Row gutter={[16, 16]} className={styles.activitiesGrid}>
            {paginatedActivities.map((activity) => (
              <Col xs={24} sm={12} lg={8} key={activity.id}>
                <ActivityCard
                  activity={activity}
                  isTeacher={isTeacher}
                  onBookingClick={handleBookingClick}
                  onViewReviews={() => handleShowReviews(activity)}
                />
              </Col>
            ))}
          </Row>
          <div className={styles.pagination}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) setPageSize(size);
              }}
              showSizeChanger
              pageSizeOptions={["6", "9", "12", "18", "24"]}
            />
          </div>
        </>
      ) : (
        <Empty description={t("learning.noActivities")} />
      )}

      {selectedActivity?.type === "individual" && (
        <IndividualBookingModal
          visible={isBookingModalOpen}
          selectedActivity={selectedActivity}
          onCancel={handleCloseBookingModal}
          onSubmit={handleSubmitBooking}
          firstLessonInfo={firstLessonInfo}
        />
      )}

      {selectedActivity?.type === "group" && (
        <GroupBookingModal
          visible={isBookingModalOpen}
          selectedActivity={selectedActivity}
          onCancel={handleCloseBookingModal}
          onSubmit={handleSubmitBooking}
        />
      )}

      {selectedActivity &&
        selectedActivity.type !== "individual" &&
        selectedActivity.type !== "group" && (
          <DefaultBookingModal
            visible={isBookingModalOpen}
            selectedActivity={selectedActivity}
            onCancel={handleCloseBookingModal}
            onSubmit={handleSubmitBooking}
          />
        )}

      <ReviewsModal
        visible={reviewsModalVisible}
        activity={selectedActivityForReviews}
        onCancel={() => {
          setReviewsModalVisible(false);
          setSelectedActivityForReviews(null);
        }}
        user={user}
        onReviewChange={handleReviewChange}
      />

      <BalanceModal
        visible={balanceModalVisible}
        onCancel={() => setBalanceModalVisible(false)}
        onSuccess={fetchBalance}
      />
    </div>
  );
};

export default Learning;