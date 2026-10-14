/**
 * Interactive Leaflet Map Component with OpenStreetMap
 * Supports Driver GPS tracking, Delivery destination pins, and Location picking
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, ExternalLink } from 'lucide-react';

interface MarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'DRIVER' | 'DESTINATION' | 'WAREHOUSE' | 'CUSTOMER';
  details?: string;
  status?: string;
}

interface LeafletMapProps {
  markers?: MarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  allowSelectLocation?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  showNavigationButton?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers = [],
  center = [41.311081, 69.240562], // Tashkent default
  zoom = 12,
  height = '350px',
  allowSelectLocation = false,
  onLocationSelect,
  showNavigationButton = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> AquaFlow',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      if (allowSelectLocation && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Create custom SVG icons
    const createCustomIcon = (type: string, title: string) => {
      let bgColor = '#0284c7'; // Blue for driver
      let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5a2 2 0 0 0-2 2v7h3"/></svg>`;

      if (type === 'DESTINATION' || type === 'CUSTOMER') {
        bgColor = '#ef4444'; // Red for delivery destination
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      } else if (type === 'WAREHOUSE') {
        bgColor = '#0d9488'; // Teal for warehouse
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      }

      const html = `
        <div style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white; transform: translate(-50%, -50%);">
          ${iconSvg}
        </div>
      `;

      return L.divIcon({
        html,
        className: 'custom-map-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
    };

    const latLngs: L.LatLngExpression[] = [];

    markers.forEach(m => {
      if (!m.lat || !m.lng) return;
      const marker = L.marker([m.lat, m.lng], {
        icon: createCustomIcon(m.type, m.title),
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">${m.title}</strong>
          ${m.details ? `<div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">${m.details}</div>` : ''}
          ${m.status ? `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">${m.status}</span>` : ''}
          <div style="margin-top: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline; font-size: 11px;">
              Google Xaritada yo'l ochish &rarr;
            </a>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      markersGroup.addLayer(marker);
      latLngs.push([m.lat, m.lng]);
    });

    if (latLngs.length > 1) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 14);
    }
  }, [markers]);

  const targetCoords = markers.find(m => m.type === 'DESTINATION') || markers[0];

  return (
    <div className="relative rounded-xl overflow-hidden border border-sky-100 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {allowSelectLocation && (
        <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-sm border border-slate-200">
          📍 Xaritani bosib manzilni tanlang
        </div>
      )}

      {showNavigationButton && targetCoords && (
        <div className="absolute bottom-3 right-3 z-[1000] flex gap-2">
          <a
            href={`https://yandex.com/maps/?rtext=~${targetCoords.lat},${targetCoords.lng}&rtt=auto`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-medium rounded-lg shadow-md border border-slate-200 flex items-center gap-1 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-500" />
            Yandex Navigatsiya
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${targetCoords.lat},${targetCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-lg shadow-md flex items-center gap-1 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Google Maps
          </a>
        </div>
      )}
    </div>
  );
};
