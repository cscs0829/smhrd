'use client'

import { createTheme } from '@mui/material/styles'

/* eslint-disable @typescript-eslint/no-explicit-any */

// MUI 컴포넌트의 포털 컨테이너 설정
export const createMuiTheme = (mode?: 'light' | 'dark') => {
  const themeMode = mode || 'light'
  
  // Next.js의 루트 엘리먼트 찾기
  const getRootElement = () => {
    if (typeof document !== 'undefined') {
      return document.getElementById('__next') || document.body
    }
    return null
  }

  return createTheme({
    palette: {
      mode: themeMode === 'dark' ? 'dark' : 'light',
      primary: {
        main: themeMode === 'dark' ? '#90caf9' : '#1976d2',
        light: themeMode === 'dark' ? '#e3f2fd' : '#42a5f5',
        dark: themeMode === 'dark' ? '#42a5f5' : '#1565c0',
        contrastText: themeMode === 'dark' ? '#000' : '#fff',
      },
      secondary: {
        main: themeMode === 'dark' ? '#f48fb1' : '#dc004e',
        light: themeMode === 'dark' ? '#fce4ec' : '#ff5983',
        dark: themeMode === 'dark' ? '#c2185b' : '#9a0036',
        contrastText: themeMode === 'dark' ? '#000' : '#fff',
      },
      background: {
        default: themeMode === 'dark' ? '#121212' : '#ffffff',
        paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: themeMode === 'dark' ? '#ffffff' : '#000000',
        secondary: themeMode === 'dark' ? '#b0b0b0' : '#666666',
      },
      divider: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    components: {
      // Popover 컴포넌트 설정 (Select 드롭다운에서 사용) - 강화된 버전
      MuiPopover: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
          // 데스크톱에서 더 나은 위치 조정
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        },
        styleOverrides: {
          root: {
            zIndex: 99999,
            isolation: 'isolate',
            '&[data-popper-placement]': {
              zIndex: 99999,
            },
          },
          paper: {
            zIndex: 99999,
            isolation: 'isolate',
            cursor: 'auto',
            pointerEvents: 'auto',
            '& *': {
              pointerEvents: 'auto',
            },
          },
        },
      },
      // Popper 컴포넌트 설정
      MuiPopper: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9999,
          },
        },
      },
      // Menu 컴포넌트 설정 - aria-hidden 문제 해결
      MuiMenu: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
          // 메뉴 위치 최적화
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        },
        styleOverrides: {
          root: {
            zIndex: 99999,
            isolation: 'isolate',
            '&[data-popper-placement]': {
              zIndex: 99999,
            },
            // aria-hidden 무시 - CSS 문자열로 처리
            '&[aria-hidden="true"]': {
              visibility: 'visible !important' as any,
              opacity: '1 !important' as any,
              pointerEvents: 'auto !important' as any,
            },
          },
          paper: {
            zIndex: 99999,
            isolation: 'isolate',
            cursor: 'auto',
            pointerEvents: 'auto',
            maxHeight: '300px',
            overflowY: 'auto',
            '& *': {
              pointerEvents: 'auto',
            },
            // aria-hidden 무시 - CSS 문자열로 처리
            '&[aria-hidden="true"]': {
              visibility: 'visible !important' as any,
              opacity: '1 !important' as any,
              pointerEvents: 'auto !important' as any,
            },
          },
          list: {
            padding: '4px 0',
            '& .MuiMenuItem-root': {
              cursor: 'pointer',
              pointerEvents: 'auto',
              userSelect: 'none',
              minHeight: '36px',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: themeMode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.12)',
                '&:hover': {
                  backgroundColor: themeMode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.16)',
                },
              },
              // aria-hidden 무시 - CSS 문자열로 처리
              '&[aria-hidden="true"]': {
                visibility: 'visible !important' as any,
                opacity: '1 !important' as any,
                pointerEvents: 'auto !important' as any,
              },
            },
          },
        },
      },
      // Modal 컴포넌트 설정
      MuiModal: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9998, // 모달보다 낮게 설정
          },
        },
      },
      // Dialog 컴포넌트 설정
      MuiDialog: {
        defaultProps: {
          container: getRootElement,
          disablePortal: false,
        },
        styleOverrides: {
          root: {
            zIndex: 9998, // 모달보다 낮게 설정
          },
        },
      },
      // Select 컴포넌트 설정
      MuiSelect: {
        styleOverrides: {
          root: {
            '&.MuiInputBase-root': {
              cursor: 'pointer',
              pointerEvents: 'auto',
            },
          },
          select: {
            cursor: 'pointer',
            pointerEvents: 'auto',
            userSelect: 'none',
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
          icon: {
            cursor: 'pointer',
            pointerEvents: 'auto',
          },
        },
      },
      // MenuItem 컴포넌트 설정
      MuiMenuItem: {
        styleOverrides: {
          root: {
            cursor: 'pointer',
            pointerEvents: 'auto',
            '&:hover': {
              backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: themeMode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.12)',
              '&:hover': {
                backgroundColor: themeMode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.16)',
              },
            },
          },
        },
      },
      // TablePagination 컴포넌트 설정 - aria-hidden 문제 해결
      MuiTablePagination: {
        defaultProps: {
          // Select 컴포넌트의 기본 설정
          SelectProps: {
            // 포털 사용하지 않고 직접 렌더링 (모바일과 동일)
            MenuProps: {
              disablePortal: true,
              // z-index를 적절히 설정
              PaperProps: {
                sx: {
                  zIndex: 1300,
                  // aria-hidden 무시하고 상호작용 가능하도록 - CSS 문자열로 처리
                  visibility: 'visible !important' as any,
                  opacity: '1 !important' as any,
                  pointerEvents: 'auto !important' as any,
                },
              },
            },
            // aria-hidden 속성 제거
            'aria-hidden': false,
            sx: {
              // aria-hidden 무시하고 포커스 가능하도록 - CSS 문자열로 처리
              visibility: 'visible !important' as any,
              opacity: '1 !important' as any,
              pointerEvents: 'auto !important' as any,
              '&[aria-hidden="true"]': {
                visibility: 'visible !important' as any,
                opacity: '1 !important' as any,
                pointerEvents: 'auto !important' as any,
              },
            },
          },
        },
        styleOverrides: {
          root: {
            // CSS 파일에서 처리하므로 최소한만 설정
            '& *': {
              pointerEvents: 'auto',
            },
            // aria-hidden 상태에서도 상호작용 가능하도록 - CSS 문자열로 처리
            '&[aria-hidden="true"] *': {
              visibility: 'visible !important' as any,
              opacity: '1 !important' as any,
              pointerEvents: 'auto !important' as any,
            },
          },
          select: {
            // aria-hidden 무시 - CSS 문자열로 처리
            '&[aria-hidden="true"]': {
              visibility: 'visible !important' as any,
              opacity: '1 !important' as any,
              pointerEvents: 'auto !important' as any,
            },
          },
        },
      },
    },
    // z-index 값 설정 - 더 높은 값으로 업데이트
    zIndex: {
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 10001, // 편집 모달보다 높게 설정
      snackbar: 10002,
      tooltip: 10003,
    },
  })
}