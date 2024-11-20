import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

  // Google Sheetsから定期的にデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('YOUR_GOOGLE_SHEETS_API_ENDPOINT');
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
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
            <CardContent className="p-0">
              <MapContainer
                center={[35.681236, 139.767125]}
                zoom={16}
                className="h-96"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {filteredEvents.map((event) => (
                  <Marker
                    key={event.id}
                    position={[event.latitude, event.longitude]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{event.projectName}</h3>
                        <p>{event.name}</p>
                        <p>{event.startTime} - {event.endTime}</p>
                        <p>{event.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
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