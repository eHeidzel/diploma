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
import { useTranslation } from "react-i18next";
import { useAdaptiveLevel } from "../hooks/useAdaptiveLevel";

const { Title } = Typography;
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
  const { t } = useTranslation();
  const { getTitleLevel } = useAdaptiveLevel();
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
      // Проверяем, что данные существуют
      const data = response.data || {};
      setWorkload({
        totalHours: data.totalHours || 0,
        completedHours: data.completedHours || 0,
        plannedHours: data.plannedHours || 0,
        cancelledHours: data.cancelledHours || 0,
        lessons: data.lessons || [],
      });
    } catch (error: any) {
      console.error("Error fetching workload:", error);
      message.error(
        error.response?.data?.message || t("workload.loading"),
      );
      // Устанавливаем пустые данные при ошибке
      setWorkload({
        totalHours: 0,
        completedHours: 0,
        plannedHours: 0,
        cancelledHours: 0,
        lessons: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("workload.table.date"),
      dataIndex: "date",
      key: "date",
      render: (date: string) => date ? dayjs(date).format("DD.MM.YYYY") : "-",
      sorter: (a: Lesson, b: Lesson) =>
        dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: t("workload.table.activity"),
      dataIndex: "activityTitle",
      key: "activityTitle",
      render: (title: string) => title || "-",
    },
    {
      title: t("workload.table.time"),
      key: "time",
      render: (_: any, record: Lesson) =>
        record.startTime && record.endTime 
          ? `${record.startTime} - ${record.endTime}` 
          : "-",
    },
    {
      title: t("workload.table.duration"),
      dataIndex: "duration",
      key: "duration",
      render: (duration: string) => duration || "-",
    },
    {
      title: t("workload.table.hours"),
      dataIndex: "hoursAstronomical",
      key: "hoursAstronomical",
      render: (hours: number) => 
        hours !== undefined && hours !== null 
          ? `${hours.toFixed(1)} ${t("workload.stats.hours")}` 
          : "-",
    },
    {
      title: t("workload.table.hourType"),
      dataIndex: "hourType",
      key: "hourType",
      render: (type: string) => {
        if (!type) return <Tag color="default">-</Tag>;
        return (
          <Tag color={type === "academic" ? "blue" : "gold"}>
            {type === "academic" ? t("workload.table.academic") : t("workload.table.astronomical")}
          </Tag>
        );
      },
    },
    {
      title: t("workload.table.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (!status) return <Tag color="default">-</Tag>;
        const statusMap: Record<string, { color: string; label: string }> = {
          planned: { color: "blue", label: t("workload.statuses.planned") },
          completed: { color: "green", label: t("workload.statuses.completed") },
          cancelled: { color: "red", label: t("workload.statuses.cancelled") },
          in_progress: { color: "orange", label: t("workload.statuses.in_progress") },
        };
        const config = statusMap[status] || { color: "default", label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: [
        { text: t("workload.statuses.planned"), value: "planned" },
        { text: t("workload.statuses.completed"), value: "completed" },
        { text: t("workload.statuses.cancelled"), value: "cancelled" },
      ],
      onFilter: (value: any, record: Lesson) => record.status === value,
    },
  ];

  if (loading && !workload) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip={t("workload.loading")} />
      </div>
    );
  }

  // Проверяем, есть ли данные для отображения
  const hasData = workload && workload.lessons && workload.lessons.length > 0;

  return (
    <div className={styles.container}>
      <Title level={getTitleLevel(3)}>{t("workload.title")}</Title>

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
            {t("workload.filter.show")}
          </Button>
        </Space>
      </Card>

      {workload && (
        <>
          <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={t("workload.stats.total")}
                  value={workload.totalHours?.toFixed(1) || "0.0"}
                  prefix={<ClockCircleOutlined />}
                  suffix={t("workload.stats.hours")}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={t("workload.stats.completed")}
                  value={workload.completedHours?.toFixed(1) || "0.0"}
                  prefix={<CheckCircleOutlined />}
                  suffix={t("workload.stats.hours")}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={t("workload.stats.planned")}
                  value={workload.plannedHours?.toFixed(1) || "0.0"}
                  prefix={<CalendarOutlined />}
                  suffix={t("workload.stats.hours")}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={t("workload.stats.cancelled")}
                  value={workload.cancelledHours?.toFixed(1) || "0.0"}
                  prefix={<CloseCircleOutlined />}
                  suffix={t("workload.stats.hours")}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row>

          <Card title={t("workload.table.activity")} className={styles.tableCard}>
            <Table
              columns={columns}
              dataSource={workload.lessons || []}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Всего ${total} записей`
              }}
              locale={{ 
                emptyText: <Empty description={t("workload.noData")} /> 
              }}
            />
          </Card>
        </>
      )}

      {!hasData && !loading && (
        <Card>
          <Empty description={t("workload.noData")} />
        </Card>
      )}
    </div>
  );
};

export default Workload;