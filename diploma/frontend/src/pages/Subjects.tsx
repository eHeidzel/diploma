import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Typography,
  Space,
  Empty,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import styles from "../css/subjects.module.css";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title } = Typography;

interface Subject {
  id: number;
  name: string;
  description: string;
  color: string;
}

interface SubjectsProps {
  user?: any;
}

const Subjects: React.FC<SubjectsProps> = ({ user }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
  const selectedColor = Form.useWatch("color", form);

  const colors = [
    "#52c41a",
    "#1890ff",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#fa8c16",
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      message.error(t("subjects.loadingError"));
    }
  };

  const handleCreateSubject = async (values: any) => {
    setLoading(true);
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, values);
        message.success(t("subjects.updateSuccess"));
      } else {
        await api.post("/subjects", values);
        message.success(t("subjects.createSuccess"));
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      message.error(t("subjects.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = (id: number) => {
    Modal.confirm({
      title: t("subjects.deleteConfirmTitle"),
      content: t("subjects.deleteConfirmContent"),
      okText: t("subjects.deleteButton"),
      cancelText: t("subjects.cancelButton"),
      onOk: async () => {
        try {
          await api.delete(`/subjects/${id}`);
          message.success(t("subjects.deleteSuccess"));
          fetchSubjects();
        } catch (error) {
          message.error(t("subjects.deleteError"));
        }
      },
    });
  };

  const isTeacher = user?.role === "teacher";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={getTitleLevel(3)} className={styles.headerTitle}>
          {t("subjects.title")}
        </Title>
        {isTeacher && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSubject(null);
              form.resetFields();
              form.setFieldsValue({ color: colors[0] });
              setIsModalOpen(true);
            }}
            className={styles.addButton}
          >
            {t("subjects.addButton")}
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} className={styles.subjectsGrid}>
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <Col xs={24} sm={12} md={8} lg={6} key={subject.id}>
              <Card
                hoverable
                className={`${styles.subjectCard} ${styles.subjectCardWithBorder}`}
                style={{ borderTopColor: subject.color || colors[0] }}
                actions={
                  isTeacher
                    ? [
                        <EditOutlined
                          key="edit"
                          className={styles.editAction}
                          onClick={() => {
                            setEditingSubject(subject);
                            form.setFieldsValue(subject);
                            setIsModalOpen(true);
                          }}
                        />,
                        <DeleteOutlined
                          key="delete"
                          className={styles.deleteAction}
                          onClick={() => handleDeleteSubject(subject.id)}
                        />,
                      ]
                    : [
                        <Button
                          key="enroll"
                          type="link"
                          className={styles.enrollButton}
                          onClick={() =>
                            message.success(
                              t("subjects.enrollSuccess", {
                                name: subject.name,
                              }),
                            )
                          }
                        >
                          {t("subjects.enrollButton")}
                        </Button>,
                      ]
                }
              >
                <Card.Meta
                  avatar={
                    <BookOutlined
                      className={styles.subjectIcon}
                      style={{ color: subject.color || colors[0] }}
                    />
                  }
                  title={
                    <span className={styles.subjectName}>{subject.name}</span>
                  }
                  description={
                    <div className={styles.subjectDescription}>
                      {subject.description || t("subjects.noDescription")}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description={t("subjects.noSubjects")} />
          </Col>
        )}
      </Row>

      <Modal
        title={
          editingSubject ? t("subjects.editTitle") : t("subjects.createTitle")
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
          form.resetFields();
        }}
        footer={null}
        width="95%"
        className={styles.subjectModal}
      >
        <Form form={form} onFinish={handleCreateSubject} layout="vertical">
          <Form.Item
            name="name"
            label={t("subjects.nameLabel")}
            rules={[{ required: true, message: t("subjects.nameRequired") }]}
          >
            <Input
              placeholder={t("subjects.namePlaceholder")}
              size="large"
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item name="description" label={t("subjects.descriptionLabel")}>
            <Input.TextArea
              rows={3}
              placeholder={t("subjects.descriptionPlaceholder")}
              className={styles.formTextarea}
            />
          </Form.Item>

          <Form.Item
            name="color"
            label={t("subjects.colorLabel")}
            initialValue={colors[0]}
          >
            <Space wrap className={styles.colorPicker}>
              {colors.map((color) => (
                <div
                  key={color}
                  onClick={() => form.setFieldsValue({ color })}
                  className={`${styles.colorOption} ${
                    selectedColor === color ? styles.colorOptionActive : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </Space>
          </Form.Item>

          <Form.Item className={styles.modalFooter}>
            <Space className={styles.modalButtons}>
              <Button onClick={() => setIsModalOpen(false)}>
                {t("subjects.cancelButton")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.submitButton}
              >
                {editingSubject
                  ? t("subjects.saveButton")
                  : t("subjects.createButton")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Subjects;
