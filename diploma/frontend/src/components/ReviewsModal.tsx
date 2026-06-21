
import React, { useState, useEffect } from "react";
import {
  Modal,
  Rate,
  Form,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  message,
  Popconfirm,
  Empty,
  Divider,
  Alert,
  Tooltip,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { reviewsApi, scheduleApi } from "../services/api";
import styles from "../css/reviews.module.css";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ReviewsModalProps {
  visible: boolean;
  activity: any;
  onCancel: () => void;
  user: any;
  onReviewChange?: () => void; 
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({
  visible,
  activity,
  onCancel,
  user,
  onReviewChange,
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [canCreateReview, setCanCreateReview] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form] = Form.useForm();

  const isAuthenticated = !!user && user?.role !== "guest";
  const isStudent = user?.role === "student";
  const currentUserId = user?.id;

  useEffect(() => {
    if (visible && activity) {
      fetchReviews();
      if (isAuthenticated && isStudent) {
        checkUserCanCreateReview();
      }
      setEditingReview(null);
      form.resetFields();
    }
  }, [visible, activity, isAuthenticated, isStudent]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsApi.getByActivity(activity?.id);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      message.error("Ошибка загрузки отзывов");
    } finally {
      setLoading(false);
    }
  };

  const checkUserCanCreateReview = async () => {
    setChecking(true);
    try {
      const response = await scheduleApi.checkEnrollment(activity?.id);
      setCanCreateReview(response.data.enrolled);
    } catch (error) {
      console.error("Error checking enrollment:", error);
      setCanCreateReview(false);
    } finally {
      setChecking(false);
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReview(review);
    form.setFieldsValue({
      rating: review.rating,
      text: review.text,
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    form.resetFields();
  };

  const refreshData = async () => {
    await fetchReviews();
    if (onReviewChange) {
      onReviewChange();
    }
  };

  const handleSubmitCreate = async (values: any) => {
    if (!isAuthenticated || !isStudent) {
      message.warning("Только ученики могут оставлять отзывы");
      return;
    }

    if (!canCreateReview) {
      message.warning(
        "Вы можете оставить отзыв только после записи на занятие",
      );
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.create(activity?.id, values);
      message.success("Отзыв добавлен");
      form.resetFields();
      await refreshData();
      await checkUserCanCreateReview();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      message.error(
        error.response?.data?.message || "Ошибка при сохранении отзыва",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitUpdate = async (values: any) => {
    if (!editingReview) return;

    setSubmitting(true);
    try {
      await reviewsApi.update(activity?.id, editingReview.id, values);
      message.success("Отзыв обновлен");
      setEditingReview(null);
      form.resetFields();
      await refreshData();
    } catch (error: any) {
      console.error("Error updating review:", error);
      message.error(
        error.response?.data?.message || "Ошибка при обновлении отзыва",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    try {
      await reviewsApi.delete(activity?.id, reviewId);
      message.success("Отзыв удален");
      if (editingReview?.id === reviewId) {
        setEditingReview(null);
        form.resetFields();
      }
      await refreshData();
      await checkUserCanCreateReview();
    } catch (error) {
      console.error("Error deleting review:", error);
      message.error("Ошибка при удалении отзыва");
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const hasUserReview = reviews.some((r) => r.userId === currentUserId);
  const showCreateForm =
    isAuthenticated &&
    isStudent &&
    canCreateReview &&
    !editingReview &&
    !hasUserReview;

  return (
    <Modal
      title={`Отзывы о занятии: ${activity?.title}`}
      open={visible}
      onCancel={() => {
        setEditingReview(null);
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={700}
      centered
      className={styles.reviewsModal}
      destroyOnClose
    >
      <div className={styles.ratingSummary}>
        <div className={styles.averageRating}>
          <Text className={styles.averageRatingValue}>
            {averageRating.toFixed(1)}
          </Text>
          <Text className={styles.averageRatingLabel}>средняя оценка</Text>
          <Text type="secondary" className={styles.reviewsCount}>
            на основе {reviews.length}{" "}
            {reviews.length === 1
              ? "отзыва"
              : reviews.length < 5
                ? "отзывов"
                : "отзывов"}
          </Text>
        </div>
      </div>

      {showCreateForm && (
        <div className={styles.reviewForm}>
          <Alert
            message="Оставить отзыв"
            description="Поделитесь впечатлениями о занятии"
            type="info"
            showIcon
            className={styles.infoAlert}
          />
          <Form form={form} layout="vertical" onFinish={handleSubmitCreate}>
            <Form.Item
              name="rating"
              label="Ваша оценка"
              rules={[{ required: true, message: "Поставьте оценку" }]}
            >
              <Rate className={styles.ratingStars} />
            </Form.Item>
            <Form.Item
              name="text"
              label="Ваш отзыв"
              rules={[
                { required: true, message: "Напишите отзыв" },
                {
                  min: 10,
                  message: "Отзыв должен содержать минимум 10 символов",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Поделитесь впечатлениями о занятии..."
                showCount
                maxLength={500}
                className={styles.reviewTextarea}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Оставить отзыв
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}

      {editingReview && (
        <div className={styles.reviewForm}>
          <div className={styles.editHeader}>
            <Alert
              message="Редактирование отзыва"
              description="Вы можете изменить свой отзыв"
              type="info"
              showIcon
              className={styles.infoAlert}
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleCancelEdit}
              className={styles.closeEditBtn}
            />
          </div>
          <Form form={form} layout="vertical" onFinish={handleSubmitUpdate}>
            <Form.Item
              name="rating"
              label="Ваша оценка"
              rules={[{ required: true, message: "Поставьте оценку" }]}
            >
              <Rate className={styles.ratingStars} />
            </Form.Item>
            <Form.Item
              name="text"
              label="Ваш отзыв"
              rules={[
                { required: true, message: "Напишите отзыв" },
                {
                  min: 10,
                  message: "Отзыв должен содержать минимум 10 символов",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Поделитесь впечатлениями о занятии..."
                showCount
                maxLength={500}
                className={styles.reviewTextarea}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancelEdit}>Отмена</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Сохранить изменения
                </Button>
                <Popconfirm
                  title="Удалить отзыв"
                  description="Вы уверены, что хотите удалить свой отзыв?"
                  onConfirm={() => handleDelete(editingReview.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button danger>Удалить отзыв</Button>
                </Popconfirm>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}

      {isAuthenticated &&
        isStudent &&
        !canCreateReview &&
        !checking &&
        !editingReview &&
        !hasUserReview && (
          <Alert
            message="Вы не можете оставить отзыв"
            description="Отзывы могут оставлять только ученики, записавшиеся на это занятие."
            type="info"
            showIcon
            className={styles.infoAlert}
          />
        )}

      {!isAuthenticated && (
        <Alert
          message="Требуется авторизация"
          description={
            <span>
              <a onClick={() => (window.location.href = "/login")}>Войдите</a>{" "}
              или{" "}
              <a onClick={() => (window.location.href = "/register")}>
                зарегистрируйтесь
              </a>
              , чтобы оставить отзыв
            </span>
          }
          type="warning"
          showIcon
          className={styles.infoAlert}
        />
      )}

      <Divider className={styles.divider} />

      <List
        className={styles.reviewsList}
        loading={loading}
        dataSource={reviews}
        locale={{
          emptyText: <Empty description="Пока нет отзывов. Будьте первым!" />,
        }}
        renderItem={(review) => {
          const isOwnReview = review.userId === currentUserId;
          const isEditing = editingReview?.id === review.id;

          return (
            <List.Item
              className={`${styles.reviewItem} ${isEditing ? styles.editingItem : ""}`}
              actions={
                isOwnReview && !isEditing
                  ? [
                      <Tooltip title="Редактировать">
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditClick(review)}
                          className={styles.editBtn}
                        />
                      </Tooltip>,
                      <Popconfirm
                        key="delete"
                        title="Удалить отзыв"
                        description="Вы уверены, что хотите удалить свой отзыв?"
                        onConfirm={() => handleDelete(review.id)}
                        okText="Да"
                        cancelText="Нет"
                      >
                        <Tooltip title="Удалить">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            className={styles.deleteBtn}
                          />
                        </Tooltip>
                      </Popconfirm>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar src={review.userAvatar} icon={<UserOutlined />} />
                }
                title={
                  <div className={styles.reviewTitle}>
                    <Text strong>{review.userName}</Text>
                    <Rate
                      disabled
                      defaultValue={review.rating}
                      allowHalf
                      className={styles.reviewRating}
                    />
                    {isOwnReview && !isEditing && (
                      <Tag color="blue" className={styles.yourReviewTag}>
                        Ваш отзыв
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <>
                    <Paragraph className={styles.reviewText}>
                      {review.text}
                    </Paragraph>
                    <Text type="secondary" className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </>
                }
              />
            </List.Item>
          );
        }}
      />
    </Modal>
  );
};

export default ReviewsModal;
