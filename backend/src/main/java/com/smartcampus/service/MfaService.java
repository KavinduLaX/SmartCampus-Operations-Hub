package com.smartcampus.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class MfaService {

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1);
    private final CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public String generateQrCodeBase64(String secret, String email) throws QrGenerationException {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("SmartCampus")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        byte[] imageData = qrGenerator.generate(data);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageData);
    }

    public boolean verifyCode(String secret, String code) {
        return verifier.isValidCode(secret, code);
    }
}
