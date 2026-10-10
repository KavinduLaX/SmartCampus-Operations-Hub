package com.smartcampus.config;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(
                new LocalDateToStringConverter(),
                new StringToLocalDateConverter(),
                new LocalTimeToStringConverter(),
                new StringToLocalTimeConverter(),
                new DateToLocalDateConverter(),
                new DateToLocalTimeConverter()
        ));
    }

    @WritingConverter
    static class LocalDateToStringConverter implements Converter<LocalDate, String> {
        @Override
        public String convert(LocalDate source) {
            return source != null ? source.toString() : null;
        }
    }

    @ReadingConverter
    static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(String source) {
            return source != null ? LocalDate.parse(source) : null;
        }
    }

    @WritingConverter
    static class LocalTimeToStringConverter implements Converter<LocalTime, String> {
        @Override
        public String convert(LocalTime source) {
            return source != null ? source.toString() : null;
        }
    }

    @ReadingConverter
    static class StringToLocalTimeConverter implements Converter<String, LocalTime> {
        @Override
        public LocalTime convert(String source) {
            return source != null ? LocalTime.parse(source) : null;
        }
    }

    @ReadingConverter
    static class DateToLocalDateConverter implements Converter<Date, LocalDate> {
        @Override
        public LocalDate convert(Date source) {
            if (source == null) {
                return null;
            }
            return source.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
    }

    @ReadingConverter
    static class DateToLocalTimeConverter implements Converter<Date, LocalTime> {
        @Override
        public LocalTime convert(Date source) {
            if (source == null) {
                return null;
            }
            return source.toInstant().atZone(ZoneId.systemDefault()).toLocalTime();
        }
    }
}
