package com.smartcampus.controller;

import com.smartcampus.model.ResourceUsage;
import com.smartcampus.service.ResourceUsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
public class ResourceUsageController {

    @Autowired
    private ResourceUsageService service;

    @GetMapping("/resource-heatmap")
    public List<ResourceHeatmapDTO> getHeatmap() {
        return service.getHeatmapData().stream()
                .map(usage -> new ResourceHeatmapDTO(
                        usage.getResourceName(),
                        usage.getResourceType(),
                        usage.getTimeSlot(),
                        usage.getUsageCount()
                ))
                .collect(Collectors.toList());
    }

    public record ResourceHeatmapDTO(String resource, String type, String timeSlot, int count) {}
}
