
import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Space,
  Rate,
  Tag,
  Button,
  Modal,
  Row,
  Col,
  Statistic,
  Tabs,
  message,
  Form,
  Input,
  Empty,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  ProjectOutlined,
  GithubOutlined,
  SmileOutlined,
  TrophyOutlined,
  RocketOutlined,
  MailOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api, { dashboardApi, schoolReviewsApi } from "../services/api";
import styles from "../css/dashboard.module.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DashboardHomeProps {
  user: any;
  t: any;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [reviews, setReviews] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const isAuthenticated = !!user && user?.role !== "guest" && !user?.isGuest;
  const isStudent = user?.role === "student";
  const currentUserId = user?.id;

  useEffect(() => {
    fetchData();
    if (isAuthenticated && isStudent) {
      checkUserReview();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, teachersRes, projectsRes, statsRes] =
        await Promise.all([
          schoolReviewsApi.getAll(),
          api.get("/users/teachers"),
          dashboardApi.getProjects(),
          dashboardApi.getStatistics(),
        ]);

      const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
      setReviews(reviewsData);

      const formattedTeachers = Array.isArray(teachersRes.data)
        ? teachersRes.data.map((teacher: any) => ({
            id: teacher.id,
            name: teacher.name,
            role: "Преподаватель",
            experience:
              teacher.bio?.match(/\d+\s*лет/)?.[0] || "Опыт не указан",
            company: teacher.city || "Компания не указана",
            avatar: teacher.avatar,
            bio: teacher.bio || "",
            skills: [],
            contacts: {
              email: teacher.email,
            },
          }))
        : [];

      setTeachers(formattedTeachers);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      setStatistics(Array.isArray(statsRes.data) ? statsRes.data : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const response = await schoolReviewsApi.getMy();
      if (response.data) {
        setEditingReview(response.data);
      }
    } catch (error) {
      setEditingReview(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingReview(null);
    form.resetFields();
    setReviewModalVisible(true);
  };

  const handleOpenEditModal = (review: any) => {
    setEditingReview(review);
    form.setFieldsValue({
      rating: review.rating,
      text: review.text,
    });
    setReviewModalVisible(true);
  };

  const handleCancelModal = () => {
    setEditingReview(null);
    form.resetFields();
    setReviewModalVisible(false);
  };

  const handleSubmitReview = async (values: {
    rating: number;
    text: string;
  }) => {
    if (!isAuthenticated || !isStudent) {
      message.warning("Только авторизованные ученики могут оставлять отзывы");
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await schoolReviewsApi.update(editingReview.id, values);
        message.success("Отзыв обновлен");
      } else {
        await schoolReviewsApi.create(values);
        message.success("Спасибо за ваш отзыв!");
      }
      form.resetFields();
      setReviewModalVisible(false);
      setEditingReview(null);
      fetchData();
      checkUserReview();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      message.error(
        error.response?.data?.message || "Ошибка при отправке отзыва",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await schoolReviewsApi.delete(reviewId);
      message.success("Отзыв удален");
      if (editingReview?.id === reviewId) {
        setEditingReview(null);
      }
      fetchData();
      checkUserReview();
    } catch (error) {
      console.error("Error deleting review:", error);
      message.error("Ошибка при удалении отзыва");
    }
  };

  const getStatIcon = (title: string) => {
    if (title?.includes("студентов")) return <SmileOutlined />;
    if (title?.includes("преподавател")) return <TrophyOutlined />;
    if (title?.includes("проект")) return <RocketOutlined />;
    return <UserOutlined />;
  };

  const renderReviews = () => {
    const hasUserReview = reviews.some((r) => r.userId === currentUserId);
    const canCreate =
      isAuthenticated && isStudent && !hasUserReview && !editingReview;

    return (
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <MessageOutlined className={styles.sectionIcon} />
          <Title level={3}>Отзывы наших студентов</Title>
          <Text type="secondary">Реальные отзывы о нашей школе</Text>
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              style={{ marginTop: 16 }}
            >
              Оставить отзыв
            </Button>
          )}
        </div>

        <Row gutter={[16, 16]}>
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const isOwnReview = review.userId === currentUserId;

              return (
                <Col xs={24} md={12} key={review.id}>
                  <Card className={styles.reviewCard} hoverable>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <Space
                        style={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Space>
                          <Avatar
                            size={48}
                            src={review.avatar}
                            icon={<UserOutlined />}
                          />
                          <div>
                            <Text strong>{review.name}</Text>
                            <br />
                            <Text type="secondary">
                              {review.role} в {review.company}
                            </Text>
                          </div>
                        </Space>
                        {isOwnReview && (
                          <Space>
                            <Tooltip title="Редактировать">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleOpenEditModal(review)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="Удалить отзыв"
                              description="Вы уверены, что хотите удалить свой отзыв?"
                              onConfirm={() => handleDeleteReview(review.id)}
                              okText="Да"
                              cancelText="Нет"
                            >
                              <Tooltip title="Удалить">
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                        )}
                      </Space>
                      <Rate disabled defaultValue={review.rating} allowHalf />
                      <Text type="secondary" className={styles.reviewDate}>
                        {new Date(review.date).toLocaleDateString()}
                      </Text>
                      <Paragraph
                        ellipsis={{
                          rows: 3,
                          expandable: true,
                          symbol: "Читать далее",
                        }}
                      >
                        {review.text}
                      </Paragraph>
                    </Space>
                  </Card>
                </Col>
              );
            })
          ) : (
            <Col span={24}>
              <Empty description="Пока нет отзывов. Будьте первым!" />
            </Col>
          )}
        </Row>

        <Modal
          title={
            editingReview ? "Редактировать отзыв" : "Оставить отзыв о школе"
          }
          open={reviewModalVisible}
          onCancel={handleCancelModal}
          footer={null}
          width={500}
          centered
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSubmitReview}>
            <Form.Item
              name="rating"
              label="Оценка"
              rules={[{ required: true, message: "Поставьте оценку" }]}
            >
              <Rate />
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
                {
                  max: 1000,
                  message: "Отзыв не должен превышать 1000 символов",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Поделитесь впечатлениями о школе..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancelModal}>Отмена</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingReview ? "Сохранить изменения" : "Отправить отзыв"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  const renderTeachers = () => (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <TeamOutlined className={styles.sectionIcon} />
        <Title level={3}>Наши преподаватели</Title>
        <Text type="secondary">Опытные практики из ведущих IT-компаний</Text>
      </div>
      <Row gutter={[16, 16]}>
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <Col xs={24} sm={12} lg={8} key={teacher.id}>
              <Card className={styles.teacherCard} hoverable>
                <div className={styles.teacherAvatar}>
                  <Avatar
                    size={80}
                    src={teacher.avatar}
                    icon={<UserOutlined />}
                  />
                </div>
                <div className={styles.teacherInfo}>
                  <Title level={4}>{teacher.name}</Title>
                  <Text strong>{teacher.role}</Text>
                  <br />
                  <Text type="secondary">{teacher.company}</Text>
                  <br />
                  <Text type="secondary">{teacher.experience}</Text>
                  <div className={styles.teacherSkills}>
                    {teacher.skills?.map((skill: string) => (
                      <Tag key={skill} color="green">
                        {skill}
                      </Tag>
                    ))}
                  </div>
                  <Button
                    type="link"
                    onClick={() => setSelectedTeacher(teacher)}
                    className={styles.moreButton}
                  >
                    Подробнее о преподавателе
                  </Button>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="Нет преподавателей" />
          </Col>
        )}
      </Row>

      <Modal
        title={selectedTeacher?.name}
        open={!!selectedTeacher}
        onCancel={() => setSelectedTeacher(null)}
        footer={null}
        width={600}
        centered
        className={styles.teacherModal}
      >
        {selectedTeacher && (
          <div className={styles.teacherModalContent}>
            <div className={styles.teacherModalAvatar}>
              <Avatar
                size={120}
                src={selectedTeacher.avatar}
                icon={<UserOutlined />}
              />
            </div>
            <div className={styles.teacherModalInfo}>
              <Text strong className={styles.teacherModalRole}>
                {selectedTeacher.role}
              </Text>
              <div className={styles.teacherModalDetails}>
                <div className={styles.teacherModalRow}>
                  <Text type="secondary">Email:</Text>
                  <Text>{selectedTeacher.contacts?.email}</Text>
                </div>
                <div className={styles.teacherModalRow}>
                  <Text type="secondary">О себе:</Text>
                  <Paragraph>
                    {selectedTeacher.bio || "Информация не указана"}
                  </Paragraph>
                </div>
                <div className={styles.teacherModalRow}>
                  <Text type="secondary">Навыки:</Text>
                  <div className={styles.teacherModalSkills}>
                    {selectedTeacher.skills?.map((skill: string) => (
                      <Tag key={skill} color="green">
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div className={styles.teacherModalContacts}>
                  <Button
                    icon={<MailOutlined />}
                    href={`mailto:${selectedTeacher.contacts?.email}`}
                  >
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  const renderProjects = () => (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <ProjectOutlined className={styles.sectionIcon} />
        <Title level={3}>Проекты учеников</Title>
        <Text type="secondary">Реальные проекты наших выпускников</Text>
      </div>
      <Row gutter={[16, 16]}>
        {projects.length > 0 ? (
          projects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Card
                cover={
                  <img
                    alt={project.title}
                    src={project.image}
                    className={styles.projectImage}
                  />
                }
                className={styles.projectCard}
                hoverable
                actions={[
                  <Button
                    type="link"
                    icon={<GithubOutlined />}
                    href={project.githubLink}
                    target="_blank"
                    style={{ color: "#333" }}
                  >
                    GitHub
                  </Button>,
                  <Button
                    type="link"
                    icon={<ProjectOutlined />}
                    href={project.demoLink}
                    target="_blank"
                    style={{ color: "#1890ff" }}
                  >
                    Демо
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={project.title}
                  description={
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Text type="secondary">{project.description}</Text>
                      <div>
                        {project.technologies?.map((tech: string) => (
                          <Tag key={tech} color="blue">
                            {tech}
                          </Tag>
                        ))}
                      </div>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="Нет проектов" />
          </Col>
        )}
      </Row>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <Text>Загрузка...</Text>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} className={styles.statsRow}>
        {statistics.map((stat) => (
          <Col xs={24} sm={8} key={stat.id}>
            <Card className={styles.statCard}>
              <Statistic
                title={
                  <span>
                    {getStatIcon(stat.title)} {stat.title}
                  </span>
                }
                value={stat.value}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className={styles.tabs}
        items={[
          {
            key: "projects",
            label: (
              <span>
                <ProjectOutlined /> Проекты
              </span>
            ),
            children: renderProjects(),
          },
          {
            key: "teachers",
            label: (
              <span>
                <TeamOutlined /> Преподаватели
              </span>
            ),
            children: renderTeachers(),
          },
          {
            key: "reviews",
            label: (
              <span>
                <MessageOutlined /> Отзывы
              </span>
            ),
            children: renderReviews(),
          },
        ]}
      />
    </div>
  );
};

export default DashboardHome;
