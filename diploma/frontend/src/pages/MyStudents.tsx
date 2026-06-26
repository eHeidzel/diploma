import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Avatar,
  Typography,
  Space,
  Tag,
  Button,
  Modal,
  Descriptions,
  Input,
  Select,
  message,
  Empty,
  Spin,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { teacherApi } from "../services/api";
import styles from "../css/myStudents.module.css";
import { useTranslation } from "react-i18next";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title, Text } = Typography;
const { Search } = Input;

interface MyStudentsProps {
  user: any;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  group?: string;
  progress?: number;
  lastLesson?: string;
  activeLessons?: string[];
  completedLessons?: number;
  averageRating?: number;
}

const MyStudents: React.FC<MyStudentsProps> = () => {
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");

  const getFullAvatarUrl = (avatar: string | null | undefined): string | undefined => {
    if (!avatar) return undefined;
    if (avatar.startsWith("http")) return avatar;
    // Замените localhost на ваш реальный URL
    return `https://diploma-production-f729.up.railway.app${avatar}`;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await teacherApi.getStudents();
      // Проверяем, что данные существуют и это массив
      const studentsData = Array.isArray(response.data) ? response.data : [];

      const formattedStudents = studentsData.map((student: any) => ({
        ...student,
        avatar: getFullAvatarUrl(student.avatar),
        group: student.group || student.course || t("myStudents.profile.individual"),
        name: student.name || t("common.notSpecified"),
        email: student.email || t("common.notSpecified"),
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error(t("myStudents.loading"));
      setStudents([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (student: Student) => {
    setStudentLoading(true);
    try {
      const response = await teacherApi.getStudentProfile(student.id);
      const profileData = response.data || {};
      
      // Формируем объект студента с безопасными значениями
      const formattedProfile: Student = {
        ...student,
        ...profileData,
        avatar: getFullAvatarUrl(profileData.avatar || student.avatar),
        name: profileData.name || student.name || t("common.notSpecified"),
        email: profileData.email || student.email || t("common.notSpecified"),
        phone: profileData.phone || student.phone || t("common.notSpecified"),
        group: profileData.group || student.group || t("myStudents.profile.individual"),
        progress: profileData.progress ?? student.progress ?? 0,
        completedLessons: profileData.completedLessons ?? student.completedLessons ?? 0,
        averageRating: profileData.averageRating ?? student.averageRating ?? 0,
      };
      
      setSelectedStudent(formattedProfile);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      message.error(t("myStudents.loading"));
      // Показываем базовую информацию даже при ошибке
      setSelectedStudent({
        ...student,
        avatar: getFullAvatarUrl(student.avatar),
        name: student.name || t("common.notSpecified"),
        email: student.email || t("common.notSpecified"),
        phone: student.phone || t("common.notSpecified"),
        group: student.group || t("myStudents.profile.individual"),
        progress: student.progress || 0,
        completedLessons: student.completedLessons || 0,
        averageRating: student.averageRating || 0,
      });
    } finally {
      setStudentLoading(false);
    }
  };

  // Безопасное получение уникальных групп
  const uniqueGroups = Array.from(
    new Set(students.map((s) => s.group).filter((g): g is string => Boolean(g)))
  );

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesGroup = filterGroup === "all" || student.group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const columns = [
    {
      title: t("myStudents.table.student"),
      key: "student",
      render: (_: any, record: Student) => (
        <Space>
          <Avatar
            src={record.avatar}
            icon={<UserOutlined />}
          />
          <div>
            <Text strong>{record.name || t("common.notSpecified")}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email || t("common.notSpecified")}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a: Student, b: Student) =>
        (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: t("myStudents.table.group"),
      dataIndex: "group",
      key: "group",
      render: (group: string) => (
        <Tag color={group && group !== t("myStudents.profile.individual") ? "blue" : "default"}>
          {group || t("myStudents.noGroup")}
        </Tag>
      ),
      filters: uniqueGroups.map((g) => ({
        text: g || t("myStudents.noGroup"),
        value: g,
      })),
      onFilter: (value: any, record: Student) => record.group === value,
    },
    {
      title: t("myStudents.table.actions"),
      key: "actions",
      render: (_: any, record: Student) => (
        <Button type="link" onClick={() => handleViewProfile(record)}>
          {t("myStudents.table.viewProfile")}
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Title level={getTitleLevel(3)}>{t("myStudents.title")}</Title>

      <Card className={styles.filtersCard}>
        <Space wrap size="middle" style={{ width: "100%" }}>
          <Search
            placeholder={t("myStudents.searchPlaceholder")}
            allowClear
            style={{ width: 250 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />

          <Select
            placeholder={t("myStudents.filterGroup")}
            style={{ width: 180 }}
            value={filterGroup}
            onChange={setFilterGroup}
            options={[
              { value: "all", label: t("myStudents.allGroups") },
              ...uniqueGroups.map((g) => ({
                value: g,
                label: g || t("myStudents.noGroup"),
              })),
            ]}
            allowClear
          />
        </Space>
      </Card>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" tip={t("myStudents.loading")} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Всего ${total} студентов`,
          }}
          className={styles.table}
          locale={{
            emptyText: <Empty description={t("myStudents.noStudents")} />,
          }}
        />
      )}

      <Modal
        title={t("myStudents.profile.title")}
        open={!!selectedStudent}
        onCancel={() => {
          setSelectedStudent(null);
          setStudentLoading(false);
        }}
        footer={null}
        width={450}
        centered
        destroyOnClose
      >
        {studentLoading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>{t("myStudents.profile.loading")}</p>
          </div>
        ) : (
          selectedStudent && (
            <div className={styles.studentProfile}>
              <div className={styles.profileHeader}>
                <Avatar
                  size={64}
                  src={selectedStudent.avatar}
                  icon={<UserOutlined />}
                />
                <div className={styles.profileInfo}>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedStudent.name || t("common.notSpecified")}
                  </Title>
                  <Text type="secondary">
                    {selectedStudent.email || t("common.notSpecified")}
                  </Text>
                </div>
              </div>

              <Descriptions
                column={1}
                className={styles.descriptions}
                size="small"
                bordered
              >
                <Descriptions.Item
                  label={
                    <>
                      <PhoneOutlined /> {t("myStudents.profile.phone")}
                    </>
                  }
                >
                  {selectedStudent.phone || t("common.notSpecified")}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <TeamOutlined /> {t("myStudents.profile.group")}
                    </>
                  }
                >
                  <Tag color={selectedStudent.group && selectedStudent.group !== t("myStudents.profile.individual") ? "blue" : "default"}>
                    {selectedStudent.group || t("myStudents.profile.individual")}
                  </Tag>
                </Descriptions.Item>
                {selectedStudent.progress !== undefined && (
                  <Descriptions.Item label={t("myStudents.profile.progress")}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: '100%',
                        maxWidth: 150,
                        height: 8,
                        background: '#f0f0f0',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(selectedStudent.progress || 0, 100)}%`,
                          height: '100%',
                          background: '#52c41a',
                          borderRadius: 4
                        }} />
                      </div>
                      <Text>{Math.min(selectedStudent.progress || 0, 100)}%</Text>
                    </div>
                  </Descriptions.Item>
                )}
                {selectedStudent.completedLessons !== undefined && (
                  <Descriptions.Item label={t("myStudents.profile.completedLessons")}>
                    {selectedStudent.completedLessons || 0}
                  </Descriptions.Item>
                )}
                {selectedStudent.averageRating !== undefined && (
                  <Descriptions.Item label={t("myStudents.profile.averageRating")}>
                    {selectedStudent.averageRating || t("myStudents.profile.noRating")}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default MyStudents;