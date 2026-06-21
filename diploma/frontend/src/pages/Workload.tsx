import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Space,
  Button,
  Typography,
  Tag,
  message,
  Spin,
  Empty,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { teacherApi } from "../services/api";
import styles from "../css/workload.module.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface WorkloadProps {
  user: any;
}

interface Lesson {
  id: number;
  date: string;
  activityTitle: string;
  startTime: string;
  endTime: string;
  duration: string;
  hourType: string;
  status: string;
  hoursAstronomical: number;
}

interface WorkloadData {
  totalHours: number;
  completedHours: number;
  plannedHours: number;
  cancelledHours: number;
  lessons: Lesson[];
}

const Workload: React.FC<WorkloadProps> = ({ user }) => {
  const [workload, setWorkload] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  useEffect(() => {
    fetchWorkload();
  }, [dateRange]);

  const fetchWorkload = async () => {
    setLoading(true);
    try {
      const response = await teacherApi.getWorkload(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD"),
      );
      setWorkload(response.data);
    } catch (error: any) {
      console.error("Error fetching workload:", error);
      message.error(
        error.response?.data?.message || "Ошибка загрузки нагрузки",
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD.MM.YYYY"),
      sorter: (a: Lesson, b: Lesson) =>
        dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Занятие",
      dataIndex: "activityTitle",
      key: "activityTitle",
    },
    {
      title: "Время",
      key: "time",
      render: (_: any, record: Lesson) =>
        `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Длительность",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Часы (астроном.)",
      dataIndex: "hoursAstronomical",
      key: "hoursAstronomical",
      render: (hours: number) => `${hours.toFixed(1)} ч`,
    },
    {
      title: "Тип часа",
      dataIndex: "hourType",
      key: "hourType",
      render: (type: string) => (
        <Tag color={type === "academic" ? "blue" : "gold"}>
          {type === "academic" ? "Академический" : "Астрономический"}
        </Tag>
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: any = {
          planned: "blue",
          completed: "green",
          cancelled: "red",
          in_progress: "orange",
        };
        const labels: any = {
          planned: "Запланировано",
          completed: "Проведено",
          cancelled: "Отменено",
          in_progress: "В процессе",
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
      filters: [
        { text: "Запланировано", value: "planned" },
        { text: "Проведено", value: "completed" },
        { text: "Отменено", value: "cancelled" },
      ],
      onFilter: (value: any, record: Lesson) => record.status === value,
    },
  ];

  if (loading && !workload) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="Загрузка нагрузки..." />
      </div>
    );
  }

  if (!workload) {
    return (
      <div className={styles.container}>
        <Title level={3}>Моя нагрузка</Title>
        <Card className={styles.filterCard}>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
              }
              format="DD.MM.YYYY"
            />
            <Button type="primary" onClick={fetchWorkload} loading={loading}>
              Показать
            </Button>
          </Space>
        </Card>
        <Empty description="Нет данных за выбранный период" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={3}>Моя нагрузка</Title>

      <Card className={styles.filterCard}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) =>
              dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
            }
            format="DD.MM.YYYY"
          />
          <Button type="primary" onClick={fetchWorkload} loading={loading}>
            Показать
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего часов"
              value={workload.totalHours.toFixed(1)}
              prefix={<ClockCircleOutlined />}
              suffix="астр. ч"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Проведено"
              value={workload.completedHours.toFixed(1)}
              prefix={<CheckCircleOutlined />}
              suffix="астр. ч"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Запланировано"
              value={workload.plannedHours.toFixed(1)}
              prefix={<CalendarOutlined />}
              suffix="астр. ч"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Отменено"
              value={workload.cancelledHours?.toFixed(1) || "0.0"}
              prefix={<CloseCircleOutlined />}
              suffix="астр. ч"
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Детализация занятий" className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={workload.lessons || []}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Нет занятий за выбранный период" }}
        />
      </Card>
    </div>
  );
};

export default Workload;
