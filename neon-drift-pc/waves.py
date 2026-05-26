"""Wave scaling — 100-wave campaign."""

MAX_WAVE = 100


def is_boss_wave(wave):
    return wave % 5 == 0 and wave > 0


def kills_to_clear(wave):
    if is_boss_wave(wave):
        return 1
    base = 6 + wave // 2
    return min(base, 40)


def asteroid_spawn_count(wave):
    if is_boss_wave(wave):
        return max(1, 2 + wave // 20)
    return min(2 + wave // 3, 18)


def enemy_spawn_interval(wave):
    if is_boss_wave(wave):
        return 9999
    return max(35, 130 - wave)


def asteroid_speed_mult(wave):
    return 1.0 + wave * 0.012


def enemy_speed_mult(wave):
    return 1.0 + wave * 0.015


def boss_hp(wave):
    return 20 + wave * 4 + (wave // 10) * 15


def boss_size(wave):
    return min(28 + wave // 4, 55)
