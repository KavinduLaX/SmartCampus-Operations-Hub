package com.smartcampus.service;

import java.io.IOException;
import java.io.InputStream;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.gridfs.model.GridFSFile;

@Service
public class AttachmentStorageService {

    private final GridFsTemplate gridFsTemplate;

    public AttachmentStorageService(GridFsTemplate gridFsTemplate) {
        this.gridFsTemplate = gridFsTemplate;
    }

    public String saveFile(MultipartFile file) throws IOException {
        ObjectId id = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
        );
        return id.toString();
    }

    public GridFSFile findFile(String fileId) {
        ObjectId objectId;
        try {
            objectId = new ObjectId(fileId);
        } catch (IllegalArgumentException ex) {
            return null;
        }
        return gridFsTemplate.findOne(new Query(Criteria.where("_id").is(objectId)));
    }

    public String getContentType(GridFSFile file) {
        if (file == null) {
            return "application/octet-stream";
        }
        var metadata = file.getMetadata();
        if (metadata == null) {
            return "application/octet-stream";
        }
        Object value = metadata.get("_contentType");
        return value != null ? value.toString() : "application/octet-stream";
    }

    public InputStream getFileStream(GridFSFile file) throws IOException {
        GridFsResource resource = gridFsTemplate.getResource(file);
        return resource.getInputStream();
    }
}
