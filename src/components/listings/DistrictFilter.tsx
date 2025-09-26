import { useState } from 'react';
import { provinces } from '@/data/locations';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DistrictFilterProps {
  selectedDistrict: string | null;
  onSelectDistrict: (district: string | null) => void;
}

const DistrictFilter = ({ selectedDistrict, onSelectDistrict }: DistrictFilterProps) => {
  const [expandedProvinces, setExpandedProvinces] = useState<string[]>([]);

  const toggleProvince = (provinceName: string) => {
    setExpandedProvinces(prev =>
      prev.includes(provinceName)
        ? prev.filter(p => p !== provinceName)
        : [...prev, provinceName]
    );
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-4">Filter by District</h3>
      <div
        className={`cursor-pointer py-2 px-3 rounded ${
          selectedDistrict === null ? 'bg-primary text-white' : 'hover:bg-gray-100'
        }`}
        onClick={() => onSelectDistrict(null)}
      >
        All Districts
      </div>
      {provinces.map(province => (
        <div key={province.name} className="mt-2">
          <div
            className="flex items-center justify-between cursor-pointer py-2 px-3 rounded hover:bg-gray-100"
            onClick={() => toggleProvince(province.name)}
          >
            <span className="font-medium">{province.name}</span>
            {expandedProvinces.includes(province.name) ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>
          {expandedProvinces.includes(province.name) && (
            <ul className="pl-6 mt-1">
              {province.districts.map(district => (
                <li
                  key={district}
                  className={`cursor-pointer py-1 px-3 rounded ${
                    selectedDistrict === district
                      ? 'bg-secondary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectDistrict(district)}
                >
                  {district}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default DistrictFilter;
