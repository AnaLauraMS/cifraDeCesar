package br.com.fatec.poneglyph_api.controller;
import br.com.fatec.poneglyph_api.model.User;
import br.com.fatec.poneglyph_api.repository.UserRepository;
import br.com.fatec.poneglyph_api.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    public record AuthDTO(String username, String password) {}
    public record RegisterDTO(String username, String password) {}
    public record LoginResponseDTO(String token) {}

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody AuthDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.username(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        var token = tokenService.generateToken((User) auth.getPrincipal());
        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDTO data) {
        if (this.userRepository.findByUsername(data.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Nome de usuário já está em uso.");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());

        User newUser = new User();
        newUser.setUsername(data.username());
        newUser.setPassword(encryptedPassword);

        this.userRepository.save(newUser);

        return ResponseEntity.ok("Usuário registrado com sucesso!");
    }
}
