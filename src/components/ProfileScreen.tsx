import { useState } from 'react';
import { Profile } from '../types';
import { User, Calendar, Users, ScrollText } from 'lucide-react';

interface ProfileScreenProps {
  onComplete: (profile: Profile) => void;
}

export function ProfileScreen({ onComplete }: ProfileScreenProps) {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    birthdate: '',
    gender: '男性',
    concern: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof Profile, string>> = {};

    if (!profile.name.trim()) {
      newErrors.name = '御名を記されたし';
    }
    if (!profile.birthdate) {
      newErrors.birthdate = '生誕の日を選ばれよ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear all session storage when starting new diagnosis
    sessionStorage.removeItem('isLoadingReport');
    sessionStorage.removeItem('pollingStartTime');
    sessionStorage.removeItem('currentOrderId');
    sessionStorage.removeItem('isWaitingForNewReport');
    sessionStorage.removeItem('pendingDiagnosisResult');

    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="scroll-panel max-w-2xl w-full relative p-5 sm:p-6 md:p-8 lg:p-12">
        <div className="relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-5 sm:mb-6 relative" style={{
            filter: 'drop-shadow(0 0 30px rgba(166, 124, 82, 0.5))',
            border: '3px solid rgba(166, 124, 82, 0.6)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(166, 124, 82, 0.4), inset 0 0 20px rgba(166, 124, 82, 0.1)',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.3)'
          }}>
            <img
              src="/a_mystical_and_adorable_shrine_mascot_character_de-1767804824217.png"
              alt="神社のマスコット"
              className="w-full h-full object-contain"
              style={{ borderRadius: '50%' }}
            />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 glow-text" style={{ color: 'var(--pale-gold)' }}>
            魂の記録
          </h2>

          <p className="text-xs sm:text-sm opacity-75 leading-loose max-w-lg mx-auto px-2" style={{ color: 'var(--dim-light)' }}>
            巡礼を始めるにあたり、<br />
            汝の存在を古の書に刻まねばならぬ。<br />
            記されし情報は、魂の形を明かす手がかりとなる。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
          <div>
            <label className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-sm sm:text-base font-medium flex-wrap" style={{ color: 'var(--pale-light)' }}>
              <User size={18} className="sm:w-5 sm:h-5" style={{ color: 'var(--ochre)' }} />
              <span>御名</span>
              <span className="text-xs opacity-60 font-normal">─ 汝が呼ばれし名 ─</span>
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="ancient-input"
              placeholder="名を記されよ"
            />
            {errors.name && (
              <p className="text-sm mt-2" style={{ color: 'var(--torii-red)' }}>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-sm sm:text-base font-medium flex-wrap" style={{ color: 'var(--pale-light)' }}>
              <Calendar size={18} className="sm:w-5 sm:h-5" style={{ color: 'var(--ochre)' }} />
              <span>生誕の日</span>
              <span className="text-xs opacity-60 font-normal">─ 汝が世に顕れし刻 ─</span>
            </label>
            <input
              type="date"
              value={profile.birthdate}
              onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
              className="ancient-input"
            />
            {errors.birthdate && (
              <p className="text-sm mt-2" style={{ color: 'var(--torii-red)' }}>
                {errors.birthdate}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-sm sm:text-base font-medium flex-wrap" style={{ color: 'var(--pale-light)' }}>
              <Users size={18} className="sm:w-5 sm:h-5" style={{ color: 'var(--ochre)' }} />
              <span>性</span>
              <span className="text-xs opacity-60 font-normal">─ 汝が宿せし性 ─</span>
            </label>
            <div className="flex flex-wrap gap-4 sm:gap-5">
              {(['男性', '女性', 'その他'] as const).map((gender) => (
                <label
                  key={gender}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={profile.gender === gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value as Profile['gender'] })}
                    className="w-5 h-5 cursor-pointer"
                    style={{ accentColor: 'var(--ochre)' }}
                  />
                  <span className="text-base group-hover:text-white transition-colors">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-sm sm:text-base font-medium flex-wrap" style={{ color: 'var(--pale-light)' }}>
              <ScrollText size={18} className="sm:w-5 sm:h-5" style={{ color: 'var(--rust-red)' }} />
              <span>抱える憂い（２０００文字以下）</span>
              <span className="text-xs opacity-60 font-normal">─ 任意 ─</span>
            </label>
            <textarea
              value={profile.concern}
              onChange={(e) => setProfile({ ...profile, concern: e.target.value })}
              className="ancient-input resize-none"
              rows={5}
              placeholder="心に宿る憂いがあらば、ここに記されよ（任意）"
            />
            <p className="text-xs opacity-80 mt-2" style={{ color: 'var(--text-dim)', textShadow: '0 1px 2px rgba(0, 0, 0, 1), 1px 1px 1px rgba(0, 0, 0, 0.8)' }}>
              ※ この記録は汝の診断結果と共に封じられるのみ
            </p>
          </div>

          <div className="text-center pt-1">
            <button
              type="submit"
              className="mystic-button text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
            >
              巡礼の道へ
            </button>

            <p className="text-xs opacity-80 mt-4 sm:mt-5 px-2" style={{ color: 'var(--text-dim)', textShadow: '0 1px 2px rgba(0, 0, 0, 1), 1px 1px 1px rgba(0, 0, 0, 0.8)' }}>
              ─ 次なる画面にて、百の問いが待ち受ける ─
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
