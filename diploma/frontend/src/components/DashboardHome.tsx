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
import { useTranslation } from "react-i18next";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DashboardHomeProps {
  user: any;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
  const { t } = useTranslation();
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

  const getFullAvatarUrl = (avatar: string) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `https://diploma-production-f729.up.railway.app${avatar}`;
  };

  // Функция для перевода заголовков статистики
  const getStatTitle = (title: string) => {
    const statMap: Record<string, string> = {
      "Студентов": t("dashboardHome.stats.students"),
      "Преподавателей": t("dashboardHome.stats.teachers"),
      "Проектов": t("dashboardHome.stats.projects"),
      "Students": t("dashboardHome.stats.students"),
      "Teachers": t("dashboardHome.stats.teachers"),
      "Projects": t("dashboardHome.stats.projects"),
    };
    return statMap[title] || title;
  };

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
            role: t("profile.roles.teacher"),
            experience:
              teacher.bio?.match(/\d+\s*лет/)?.[0] || t("common.notSpecified"),
            company: teacher.city || t("common.notSpecified"),
            avatar: getFullAvatarUrl(teacher.avatar),
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
      message.error(t("common.error"));
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
      message.warning(t("dashboardHome.reviews.authRequired"));
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await schoolReviewsApi.update(editingReview.id, values);
        message.success(t("dashboardHome.reviews.updateSuccess"));
      } else {
        await schoolReviewsApi.create(values);
        message.success(t("dashboardHome.reviews.createSuccess"));
      }
      form.resetFields();
      setReviewModalVisible(false);
      setEditingReview(null);
      fetchData();
      checkUserReview();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      message.error(
        error.response?.data?.message || t("dashboardHome.reviews.error"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await schoolReviewsApi.delete(reviewId);
      message.success(t("dashboardHome.reviews.deleteSuccess"));
      if (editingReview?.id === reviewId) {
        setEditingReview(null);
      }
      fetchData();
      checkUserReview();
    } catch (error) {
      console.error("Error deleting review:", error);
      message.error(t("dashboardHome.reviews.deleteError"));
    }
  };

  const getStatIcon = (title: string) => {
    const translatedTitle = getStatTitle(title);
    if (translatedTitle === t("dashboardHome.stats.students")) return <SmileOutlined />;
    if (translatedTitle === t("dashboardHome.stats.teachers")) return <TrophyOutlined />;
    if (translatedTitle === t("dashboardHome.stats.projects")) return <RocketOutlined />;
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
          <Title level={3}>{t("dashboardHome.reviews.title")}</Title>
          <Text type="secondary">{t("dashboardHome.reviews.subtitle")}</Text>
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              style={{ marginTop: 16 }}
            >
              {t("dashboardHome.reviews.create")}
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
                            src={getFullAvatarUrl(review.avatar)}
                            icon={<UserOutlined />}
                          />
                          <div>
                            <Text strong>{review.name}</Text>
                            <br />
                            <Text type="secondary">
                              {review.role} {t("common.in")} {review.company}
                            </Text>
                          </div>
                        </Space>
                        {isOwnReview && (
                          <Space>
                            <Tooltip title={t("common.edit")}>
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleOpenEditModal(review)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title={t("dashboardHome.reviews.deleteConfirm")}
                              description={t("dashboardHome.reviews.deleteDescription")}
                              onConfirm={() => handleDeleteReview(review.id)}
                              okText={t("common.yes")}
                              cancelText={t("common.no")}
                            >
                              <Tooltip title={t("common.delete")}>
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
                          symbol: t("common.readMore"),
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
              <Empty description={t("dashboardHome.reviews.noReviews")} />
            </Col>
          )}
        </Row>

        <Modal
          title={
            editingReview
              ? t("dashboardHome.reviews.editTitle")
              : t("dashboardHome.reviews.createTitle")
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
              label={t("dashboardHome.reviews.rating")}
              rules={[{ required: true, message: t("dashboardHome.reviews.ratingRequired") }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item
              name="text"
              label={t("dashboardHome.reviews.text")}
              rules={[
                { required: true, message: t("dashboardHome.reviews.textRequired") },
                {
                  min: 10,
                  message: t("dashboardHome.reviews.textMin"),
                },
                {
                  max: 1000,
                  message: t("dashboardHome.reviews.textMax"),
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={t("dashboardHome.reviews.textPlaceholder")}
                showCount
                maxLength={1000}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancelModal}>{t("common.cancel")}</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingReview
                    ? t("common.save")
                    : t("dashboardHome.reviews.submit")}
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
        <Title level={3}>{t("dashboardHome.teachers.title")}</Title>
        <Text type="secondary">{t("dashboardHome.teachers.subtitle")}</Text>
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
                    {t("dashboardHome.teachers.more")}
                  </Button>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description={t("dashboardHome.teachers.noTeachers")} />
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
                src={getFullAvatarUrl(selectedTeacher.avatar)}
                icon={<UserOutlined />}
              />
            </div>
            <div className={styles.teacherModalInfo}>
              <div className={styles.teacherModalDetails}>
                <div className={styles.teacherModalRow}>
                  <Text type="secondary">{t("common.email")}:</Text>
                  <Text>{selectedTeacher.contacts?.email}</Text>
                </div>
                <div className={styles.teacherModalRow}>
                  <Text type="secondary">{t("common.about")}:</Text>
                  <Paragraph>
                    {selectedTeacher.bio || t("common.notSpecified")}
                  </Paragraph>
                </div>
                <div className={styles.teacherModalContacts}>
                  <Button
                    icon={<MailOutlined />}
                    href={`mailto:${selectedTeacher.contacts?.email}`}
                  >
                    {t("common.email")}
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
        <Title level={3}>{t("dashboardHome.projects.title")}</Title>
        <Text type="secondary">{t("dashboardHome.projects.subtitle")}</Text>
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
                    {t("dashboardHome.projects.demo")}
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
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description={t("dashboardHome.projects.noProjects")} />
          </Col>
        )}
      </Row>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <Text>{t("common.loading")}</Text>
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
                    {getStatIcon(stat.title)} {getStatTitle(stat.title)}
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
                <ProjectOutlined /> {t("dashboardHome.projects.title")}
              </span>
            ),
            children: renderProjects(),
          },
          {
            key: "teachers",
            label: (
              <span>
                <TeamOutlined /> {t("dashboardHome.teachers.title")}
              </span>
            ),
            children: renderTeachers(),
          },
          {
            key: "reviews",
            label: (
              <span>
                <MessageOutlined /> {t("dashboardHome.reviews.title")}
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