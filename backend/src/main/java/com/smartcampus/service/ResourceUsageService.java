package com.smartcampus.service;

import com.smartcampus.model.ResourceUsage;
import com.smartcampus.repository.ResourceUsageRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ResourceUsageService {

    @Autowired
    private ResourceUsageRepository repository;

    public List<ResourceUsage> getHeatmapData() {
        return repository.findAll();
    }

    @PostConstruct
    public void seedData() {
        if (repository.count() == 0) {
            List<ResourceUsage> data = new ArrayList<>();
            String[] resources = {"Lab 1", "Lecture Hall A", "Meeting Room B", "Computer Lab 2"};
            String[] types = {"LAB", "LECTURE_HALL", "MEETING_ROOM", "LAB"};
            String[] slots = {"08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00"};
            
            int[][] counts = {
                {20, 35, 15, 45}, // Lab 1
                {5, 10, 5, 30},   // Lecture Hall A
                {5, 55, 40, 12},  // Meeting Room B
                {25, 45, 60, 20}  // Computer Lab 2
            };

            for (int i = 0; i < resources.length; i++) {
                for (int j = 0; j < slots.length; j++) {
                    ResourceUsage usage = new ResourceUsage();
                    usage.setResourceId("res-" + i);
                    usage.setResourceName(resources[i]);
                    usage.setResourceType(types[i]);
                    usage.setTimeSlot(slots[j]);
                    usage.setUsageCount(counts[i][j]);
                    usage.setLocation("Main Campus");
                    usage.setCreatedAt(Instant.now());
                    data.add(usage);
                }
            }
            repository.saveAll(data);
        }
    }
}
