package com.accounting_api.services;

import com.accounting_api.models.AccountUser;
import com.accounting_api.models.LoginRequest;
import com.accounting_api.repositories.AccountUserRepository;
import com.accounting_api.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private AccountUserRepository accountUserRepository;

    @Autowired
    private JwtService jwtService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // REGISTER USER
    public Map<String, Object> register(AccountUser user) {

        if (accountUserRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        AccountUser savedUser = accountUserRepository.save(user);

        Map<String, Object> response = createUserResponse("User registered successfully", savedUser);
        response.put("token", jwtService.generateToken(savedUser));

        return response;
    }

    // LOGIN USER
    public Map<String, Object> login(LoginRequest loginRequest) {

        AccountUser user = accountUserRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        Map<String, Object> response = createUserResponse("Login successful", user);
        response.put("token", jwtService.generateToken(user));

        return response;
    }

    // GET PROFILE
    public Map<String, Object> getProfile(Integer id) {

        AccountUser user = accountUserRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return createUserResponse("Profile found", user);
    }

    // UPDATE PROFILE
    public Map<String, Object> updateProfile(Integer id, AccountUser updatedUser) {

        AccountUser existingUser = accountUserRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        existingUser.setFullName(updatedUser.getFullName());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        existingUser.setProfileBio(updatedUser.getProfileBio());

        AccountUser savedUser = accountUserRepository.save(existingUser);

        return createUserResponse("Profile updated successfully", savedUser);
    }

    // This keeps password hidden from the response
    private Map<String, Object> createUserResponse(String message, AccountUser user) {

        Map<String, Object> response = new HashMap<>();

        response.put("message", message);
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("profileBio", user.getProfileBio());

        return response;
    }
}