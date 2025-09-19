'use client'

import { createTheme } from '@mui/material/styles'

// MUI 컴포넌트의 포털 컨테이너 설정
export const createMuiTheme = () => {
  // Next.js의 루트 엘리먼트 찾기
  const getRootElement = () => {
    if (typeof document !== 'undefined') {
      return document.getElementById('__next') || document.body
    }
    return null
  }

  return createTheme({
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
      // Menu 컴포넌트 설정 - 강화된 버전
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
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.16)',
                },
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
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.16)',
              },
            },
          },
        },
      },
      // TablePagination 컴포넌트 설정
      MuiTablePagination: {
        defaultProps: {
          // Select 컴포넌트의 기본 props 설정
          SelectProps: {
            MenuProps: {
              container: getRootElement,
              disablePortal: false,
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              PaperProps: {
                sx: {
                  zIndex: 9999,
                  maxHeight: '300px',
                  '& .MuiMenuItem-root': {
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    userSelect: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.16)',
                      },
                    },
                  },
                },
              },
            },
            sx: {
              cursor: 'pointer',
              pointerEvents: 'auto',
              '& .MuiSelect-select': {
                cursor: 'pointer',
                pointerEvents: 'auto',
                userSelect: 'none',
              },
              '& .MuiSelect-icon': {
                cursor: 'pointer',
                pointerEvents: 'auto',
              },
            },
          },
        },
        styleOverrides: {
          root: {
            position: 'relative',
            zIndex: 1,
            '& *': {
              pointerEvents: 'auto',
            },
          },
          select: {
            cursor: 'pointer',
            pointerEvents: 'auto',
            '&.MuiInputBase-root': {
              cursor: 'pointer',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 10,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-focused': {
                backgroundColor: 'transparent',
              },
            },
          },
          selectIcon: {
            cursor: 'pointer',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 11,
          },
          actions: {
            '& button': {
              cursor: 'pointer',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 10,
            },
          },
          toolbar: {
            position: 'relative',
            zIndex: 5,
            '& *': {
              pointerEvents: 'auto',
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
      modal: 9998,
      snackbar: 1400,
      tooltip: 99999,
    },
  })
}