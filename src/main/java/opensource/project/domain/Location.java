package opensource.project.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // 예: "Main Entrance", "Hall A"

    @Column(nullable = false)
    private String area; // 예: 좌표나 공간 구분 이름

    @Column
    private String time; // 감지 시간대 (예: "21:00-22:00")

    @Column
    private String light; // 조도 상태 (예: "bright", "dark")

    @Column(name = "cctv_exist")
    private Boolean cctvExist;

    @Column(name = "wifi_exist")
    private Boolean wifiExist;

    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Detection> detections;

}

