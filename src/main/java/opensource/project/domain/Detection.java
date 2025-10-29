package opensource.project.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "detection")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Detection
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 감지가 발생한 위치
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loc_id", nullable = false)
    private Location location;

    // 감지 타입 (예: CCTV, WiFi, VLM)
    @Column(nullable = false, length = 20)
    private SourceType sourcetype;

    @Column(name = "video", length = 255)
    private String video; // 감지된 영상 경로 (optional)

    @Column(name = "p_counts")
    private Integer personCount; // 감지된 사람 수

    @Column(columnDefinition = "TEXT")
    private String scene_caption; // VLM 장면 캡션 (scene-level)

    @Column
    private Float signal; // Wi-Fi 감지 강도

    // Detection 1개 → 여러 Person
    @OneToMany(mappedBy = "detection", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Person> persons;

    @OneToOne(mappedBy = "detection", cascade = CascadeType.ALL)
    private Priority priority;
}

