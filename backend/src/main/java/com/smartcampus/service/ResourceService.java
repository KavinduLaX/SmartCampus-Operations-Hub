package com.smartcampus.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resourceDetails) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
        resource.setStatus(resourceDetails.getStatus());
        resource.setDescription(resourceDetails.getDescription());

        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    public List<Resource> filterByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> filterByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    public List<Resource> filterByCapacity(int capacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity);
    }
}
