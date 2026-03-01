import { useMemo, useState, useEffect } from "preact/hooks";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function ProgressChart({ sessions = [] }) {
    const [selectedSessionName, setSelectedSessionName] = useState("All");
    const [selectedParameterName, setSelectedParameterName] = useState("All");
    const [timeRange, setTimeRange] = useState("all");

    const sessionNames = useMemo(() => {
        const names = new Set(sessions.map((s) => s.name));
        return Array.from(names);
    }, [sessions]);

    useEffect(() => {
        if (selectedSessionName === "All" && sessionNames.length > 0) {
            setSelectedSessionName(sessionNames[0]);
        }
    }, [sessionNames, selectedSessionName]);

    const filteredSessions = useMemo(() => {
        return sessions
            .filter((s) => s.name === selectedSessionName)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }, [sessions, selectedSessionName]);

    const availableParameters = useMemo(() => {
        const paramsMap = new Map();
        filteredSessions.forEach((session) => {
            session.parameters?.forEach((p) => {
                if (!paramsMap.has(p.name)) paramsMap.set(p.name, p);
            });
        });
        return Array.from(paramsMap.values());
    }, [filteredSessions]);

    useEffect(() => {
        if (selectedParameterName !== "All" && !availableParameters.find((p) => p.name === selectedParameterName)) {
            setSelectedParameterName("All");
        }
    }, [availableParameters, selectedParameterName]);

    const chartDataFiltered = useMemo(() => {
        let data = filteredSessions;
        if (timeRange !== "all") {
            const now = new Date();
            let cutoff = new Date();
            switch (timeRange) {
                case "1d": cutoff.setDate(now.getDate() - 1); break;
                case "1w": cutoff.setDate(now.getDate() - 7); break;
                case "1m": cutoff.setMonth(now.getMonth() - 1); break;
                case "1y": cutoff.setFullYear(now.getFullYear() - 1); break;
            }
            data = data.filter((s) => new Date(s.created_at) >= cutoff);
        }
        return data;
    }, [filteredSessions, timeRange]);

    const colors = [
        "#7bf4e1", "#ec4899", "#a78bfa", "#34d399",
        "#fbbf24", "#f87171", "#38bdf8", "#c084fc",
    ];

    const chartData = useMemo(() => {
        const labels = chartDataFiltered.map(s => {
            const date = new Date(s.created_at);
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        });

        let datasets = [];
        if (selectedParameterName === "All") {
            datasets = availableParameters.map((p, i) => ({
                label: p.name,
                data: chartDataFiltered.map(session => {
                    const param = session.parameters?.find(sp => sp.name === p.name);
                    return param ? parseFloat(param.value) : null;
                }),
                borderColor: colors[i % colors.length],
                backgroundColor: colors[i % colors.length],
                tension: 0.3, spanGaps: true, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5,
            }));
        } else {
            const paramInfo = availableParameters.find(p => p.name === selectedParameterName);
            datasets = [{
                label: selectedParameterName + (paramInfo?.units ? ` (${paramInfo.units})` : ""),
                data: chartDataFiltered.map(session => {
                    const param = session.parameters?.find(sp => sp.name === selectedParameterName);
                    return param ? parseFloat(param.value) : null;
                }),
                borderColor: "#7bf4e1", backgroundColor: "#7bf4e1",
                tension: 0.3, spanGaps: true, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 5,
            }];
        }
        return { labels, datasets };
    }, [chartDataFiltered, availableParameters, selectedParameterName]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#535458', font: { size: 11, family: 'Inter, system-ui, sans-serif' }, usePointStyle: true, boxWidth: 6 }
            },
            tooltip: {
                backgroundColor: '#17181c', titleColor: '#f9f9f9', bodyColor: '#f9f9f9',
                borderColor: '#2a2a2e', borderWidth: 1, padding: 10, boxPadding: 4, usePointStyle: true,
            }
        },
        scales: {
            x: {
                grid: { color: '#17181c', drawOnChartArea: false },
                ticks: { color: '#535458', font: { size: 10, family: 'Inter, system-ui, sans-serif' } }
            },
            y: {
                grid: { color: '#17181c', drawOnChartArea: false },
                ticks: {
                    color: '#535458', font: { size: 10, family: 'Inter, system-ui, sans-serif' },
                    callback: function (value) {
                        if (selectedParameterName !== "All") {
                            const paramInfo = availableParameters.find(p => p.name === selectedParameterName);
                            if (paramInfo?.units) return value + " " + paramInfo.units;
                        }
                        return value;
                    }
                }
            }
        },
        interaction: { mode: 'index', intersect: false },
    };

    if (!sessions || sessions.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#000000] text-[#535458]">
                <svg className="w-10 h-10 mb-3 text-[#17181c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-sm">No sessions recorded yet</p>
                <p className="text-xs mt-1 opacity-60">Complete a workout to see your progress</p>
            </div>
        );
    }

    const selectClass = "appearance-none w-full md:w-auto bg-[#17181c] text-[#f9f9f9] rounded-lg pl-3 pr-7 py-2 text-[11px] md:text-xs font-medium border border-[#2a2a2e] focus:outline-none focus:border-[#7bf4e1] transition-all hover:border-[#7bf4e1]/30 cursor-pointer";
    const chevron = (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#535458]">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );

    return (
        <div className="w-full h-full bg-[#000000] flex flex-col p-3 md:p-4 box-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7bf4e1]/5 to-transparent pointer-events-none"></div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 mb-3 z-20 relative px-1">
                <div className="relative flex-1 min-w-[80px]">
                    <select className={selectClass} value={selectedSessionName} onChange={(e) => setSelectedSessionName(e.currentTarget.value)}>
                        {sessionNames.map((name) => (<option key={name} value={name}>{name}</option>))}
                    </select>
                    {chevron}
                </div>
                <div className="relative flex-1 min-w-[80px]">
                    <select className={selectClass} value={selectedParameterName} onChange={(e) => setSelectedParameterName(e.currentTarget.value)}>
                        <option value="All">All Params</option>
                        {availableParameters.map((p) => (<option key={p.name} value={p.name}>{p.name}{p.units ? ` (${p.units})` : ""}</option>))}
                    </select>
                    {chevron}
                </div>
                <div className="relative flex-1 min-w-[70px]">
                    <select className={selectClass} value={timeRange} onChange={(e) => setTimeRange(e.currentTarget.value)}>
                        <option value="all">All</option>
                        <option value="1y">1Y</option>
                        <option value="1m">1M</option>
                        <option value="1w">1W</option>
                        <option value="1d">1D</option>
                    </select>
                    {chevron}
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0 relative z-10 w-full" style={{ paddingBottom: '8px' }}>
                {chartDataFiltered.length > 0 ? (
                    <div className="relative h-full w-full"><Line options={options} data={chartData} /></div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#535458]">
                        <svg className="w-8 h-8 mb-2 text-[#17181c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-xs">No data for selected filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
