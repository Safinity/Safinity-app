import { useState, useEffect } from 'react';
import styled from 'styled-components';
import MupiCard from '../components/MupiCard';
import mupisDataJson from '../data/mupis.json';
import InputField from '../components/InputField';

interface Mupi {
  id: number;
  title: string;
  image: string;
}

const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h.fontSize}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SubtitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.titulo.h2.fontFamily};
  font-size: ${({ theme }) => theme.text.titulo.h2.fontSize}px;
  line-height: ${({ theme }) => theme.text.titulo.h2.lineHeight}px;
  margin: 0;
`;

const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.palette.primary.normal};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small}px;
  padding: ${({ theme }) => `${theme.spacing.sm}px ${theme.spacing.md}px`};
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  cursor: pointer;
`;

const ListWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ScrollableList = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.lg}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.medium}px;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md}px;
  min-width: 500px;
`;

const PreviewCard = styled.div`
  width: 200px;
  height: 280px;
  border-radius: ${({ theme }) => theme.borderRadius.small}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.neutralGray};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: auto;
`;

const ModalButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  background-color: ${({ theme, variant }) =>
    variant === 'primary'
      ? theme.colors.palette.primary.normal
      : variant === 'danger'
        ? theme.colors.palette.error.normal
        : theme.colors.neutralGray};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small}px;
  padding: ${({ theme }) => `${theme.spacing.sm}px ${theme.spacing.md}px`};
  font-family: ${({ theme }) => theme.text.botao.fontFamily};
  font-size: ${({ theme }) => theme.text.botao.fontSize}px;
  cursor: pointer;
`;

const FileInput = styled.input`
  border-radius: ${({ theme }) => theme.borderRadius.small}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  color: ${({ theme }) => theme.colors.white};
  border: none;
`;

const ConfirmModalContainer = styled(ModalContainer)`
  flex-direction: column;
  align-items: center;
  min-width: 300px;
`;

const ConfirmText = styled.p`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.text.corpo.corpoTexto.fontFamily};
  font-size: ${({ theme }) => theme.text.corpo.corpoTexto.fontSize}px;
  text-align: center;
`;

export default function MupisPage() {
  const [mupisData, setMupisData] = useState<Mupi[]>(() => {
    const stored = localStorage.getItem('mupisData');
    return stored ? JSON.parse(stored) : mupisDataJson;
  });

  const [showModal, setShowModal] = useState(false);
  const [editingMupiId, setEditingMupiId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!newImage) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(newImage);
  }, [newImage]);

  const openModalForNew = () => {
    setEditingMupiId(null);
    setNewTitle('');
    setPreviewUrl(undefined);
    setNewImage(null);
    setShowModal(true);
  };

  const openModalForEdit = (mupi: Mupi) => {
    setEditingMupiId(mupi.id);
    setNewTitle(mupi.title);
    setPreviewUrl(mupi.image);
    setNewImage(null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!newTitle || !previewUrl) return;

    const updated =
      editingMupiId !== null
        ? mupisData.map(m =>
            m.id === editingMupiId ? { ...m, title: newTitle, image: previewUrl } : m,
          )
        : [...mupisData, { id: Date.now(), title: newTitle, image: previewUrl }];

    setMupisData(updated);
    localStorage.setItem('mupisData', JSON.stringify(updated));
    setShowModal(false);
  };

  const handleRemove = () => {
    if (editingMupiId === null) return;
    const updated = mupisData.filter(m => m.id !== editingMupiId);
    setMupisData(updated);
    localStorage.setItem('mupisData', JSON.stringify(updated));
    setShowConfirmModal(false);
    setShowModal(false);
  };

  return (
    <Page>
      <Title>Web Summit</Title>

      <SubtitleRow>
        <Subtitle>Mupis</Subtitle>
        <AddButton onClick={openModalForNew}>+ Add Mupi</AddButton>
      </SubtitleRow>

      <ListWrapper>
        <ScrollableList>
          {mupisData.map(mupi => (
            <div key={mupi.id} onClick={() => openModalForEdit(mupi)}>
              <MupiCard title={mupi.title} image={mupi.image} />
            </div>
          ))}
        </ScrollableList>
      </ListWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContainer onClick={e => e.stopPropagation()}>
            <PreviewCard>{previewUrl && <img src={previewUrl} />}</PreviewCard>

            <FormColumn>
              <InputField
                label="Title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />

              <FileInput
                type="file"
                accept="image/*"
                onChange={e => setNewImage(e.target.files?.[0] ?? null)}
              />

              <ButtonRow>
                {editingMupiId !== null && (
                  <ModalButton variant="danger" onClick={() => setShowConfirmModal(true)}>
                    Remove
                  </ModalButton>
                )}
                <ModalButton onClick={() => setShowModal(false)}>Cancel</ModalButton>
                <ModalButton variant="primary" onClick={handleSave}>
                  {editingMupiId !== null ? 'Save' : 'Add'}
                </ModalButton>
              </ButtonRow>
            </FormColumn>
          </ModalContainer>
        </ModalOverlay>
      )}

      {showConfirmModal && (
        <ModalOverlay onClick={() => setShowConfirmModal(false)}>
          <ConfirmModalContainer onClick={e => e.stopPropagation()}>
            <ConfirmText>Are you sure you want to remove this mupi?</ConfirmText>
            <ButtonRow>
              <ModalButton onClick={() => setShowConfirmModal(false)}>Cancel</ModalButton>
              <ModalButton variant="danger" onClick={handleRemove}>
                Remove
              </ModalButton>
            </ButtonRow>
          </ConfirmModalContainer>
        </ModalOverlay>
      )}
    </Page>
  );
}
