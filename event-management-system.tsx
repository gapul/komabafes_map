import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import _ from 'lodash';

const EventManagementSystem = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // 学校の建物の位置データ（仮のデータ）
  const locations = [
    { id: 'building-a', name: 'A棟', x: 100, y: 100 },
    { id: 'building-b', name: 'B棟', x: 200, y: 150 },
    { id: 'building-c', name: 'C棟', x: 150, y: 250 },
    { id: 'building-d', name: 'D棟', x: 300, y: 200 },
  ];

  // Google Sheetsから定期的にデータを取得（デモデータ）
  useEffect(() => {
    const demoData = [
      {
        id: 1,
        name: '山田太郎',
        projectName: 'お化け屋敷',
        location: 'A棟',
        startTime: '2024-11-12T10:00:00',
        endTime: '2024-11-12T16:00:00',
      },
      {
        id: 2,
        name: '鈴木花子',
        projectName: '軽音部ライブ',
        location: 'B棟',
        startTime: '2024-11-12T13:00:00',
        endTime: '2024-11-12T15:00:00',
      },
      // 他のイベントデータ
    ];

    setEvents(demoData);
    setLoading(false);
  }, []);

  // 検索機能
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 現在時刻に基づいてイベントをソート
  const sortedEvents = _.sortBy(filteredEvents, event => {
    const timeDiff = new Date(event.startTime) - new Date();
    return timeDiff >= 0 ? timeDiff : Infinity;
  });

  // ロケーションごとのイベントを取得
  const getEventsForLocation = (locationName) => {
    return filteredEvents.filter(event => event.location === locationName);
  };

  // マップ上のロケーションをクリックした時の処理
  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="container mx-auto p-4">
      {/* 検索バー */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="イベントまたは企画名で検索"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* タブ切り替え */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">
            <MapPin className="mr-2 h-4 w-4" />
            マップ表示
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            タイムテーブル
          </TabsTrigger>
        </TabsList>

        {/* マップ表示 */}
        <TabsContent value="map">
          <Card>
            <CardContent className="p-4">
              <div className="relative w-full h-96 bg-gray-100 rounded-lg">
                {/* SVGマップ */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full"
                >
                  {/* 背景の簡単な地図 */}
                  <rect x="0" y="0" width="400" height="400" fill="#f0f0f0" />
                  <path d="M50 50 L350 50 L350 350 L50 350 Z" 
                        fill="none" 
                        stroke="#666" 
                        strokeWidth="2" />
                  
                  {/* 建物のマーカー */}
                  {locations.map((loc) => (
                    <g key={loc.id} 
                       onClick={() => handleLocationClick(loc)}
                       className="cursor-pointer">
                      <circle
                        cx={loc.x}
                        cy={loc.y}
                        r="15"
                        fill={selectedLocation?.id === loc.id ? '#2563eb' : '#3b82f6'}
                        className="transition-colors"
                      />
                      <text
                        x={loc.x}
                        y={loc.y + 25}
                        textAnchor="middle"
                        fill="#1f2937"
                        className="text-xs"
                      >
                        {loc.name}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* 選択された場所のイベント一覧 */}
                {selectedLocation && (
                  <div className="absolute top-4 right-4 w-64 bg-white rounded-lg shadow-lg p-4">
                    <h3 className="font-bold mb-2">{selectedLocation.name}のイベント</h3>
                    {getEventsForLocation(selectedLocation.name).map((event) => (
                      <div key={event.id} className="mb-2 text-sm">
                        <p className="font-semibold">{event.projectName}</p>
                        <p className="text-gray-600">
                          {new Date(event.startTime).toLocaleTimeString()} - 
                          {new Date(event.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* タイムテーブル表示 */}
        <TabsContent value="schedule">
          <Card>
            <CardContent>
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="mb-4 border rounded-lg p-4 hover:bg-gray-50"
                >
                  <h3 className="font-bold">{event.projectName}</h3>
                  <p className="text-sm text-gray-600">{event.name}</p>
                  <p className="text-sm">
                    {new Date(event.startTime).toLocaleTimeString()} - 
                    {new Date(event.endTime).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventManagementSystem;