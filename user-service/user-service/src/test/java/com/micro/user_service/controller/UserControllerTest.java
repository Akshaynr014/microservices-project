package com.micro.user_service.controller;

import com.micro.user_service.model.User;
import com.micro.user_service.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Akshay");
        testUser.setEmail("akshay@example.com");
    }

    @Test
    void create_ShouldReturnCreatedUser() throws Exception {
        when(userService.save(any(User.class))).thenReturn(testUser);

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Akshay\",\"email\":\"akshay@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Akshay"))
                .andExpect(jsonPath("$.email").value("akshay@example.com"));
        
        verify(userService, times(1)).save(any(User.class));
    }

    @Test
    void getAll_ShouldReturnListOfUsers() throws Exception {
        List<User> users = Arrays.asList(testUser);
        when(userService.getAll()).thenReturn(users);

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Akshay"));
        
        verify(userService, times(1)).getAll();
    }

    @Test
    void getById_WhenUserExists_ShouldReturnUser() throws Exception {
        when(userService.getById(1L)).thenReturn(testUser);

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Akshay"));
        
        verify(userService, times(1)).getById(1L);
    }

    @Test
    void updateUser_ShouldReturnUpdatedUser() throws Exception {
        when(userService.updateUser(eq(1L), any(User.class))).thenReturn(testUser);

        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Akshay\",\"email\":\"akshay@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Akshay"));
        
        verify(userService, times(1)).updateUser(eq(1L), any(User.class));
    }

    @Test
    void deleteById_ShouldDeleteUser() throws Exception {
        doNothing().when(userService).deleteById(1L);

        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isOk());
        
        verify(userService, times(1)).deleteById(1L);
    }
}